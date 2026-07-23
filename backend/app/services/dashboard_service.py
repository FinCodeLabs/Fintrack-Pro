from datetime import date, datetime, timedelta
from calendar import month_name
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.transaction import Transaction, TransactionType
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.budget_repository import BudgetRepository
from app.repositories.savings_repository import SavingsRepository
from app.schemas.dashboard import DashboardSummaryResponse, CategorySpend, CashFlowPoint


class DashboardService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.tx_repo = TransactionRepository(session)
        self.budget_repo = BudgetRepository(session)
        self.savings_repo = SavingsRepository(session)

    async def get_summary(self, user_id: int) -> DashboardSummaryResponse:
        now = datetime.now()
        current_month = now.month
        current_year = now.year

        # Total income & total expense for current month
        income_query = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.INCOME,
            func.extract("month", Transaction.transaction_date) == current_month,
            func.extract("year", Transaction.transaction_date) == current_year,
        )
        expense_query = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            func.extract("month", Transaction.transaction_date) == current_month,
            func.extract("year", Transaction.transaction_date) == current_year,
        )

        inc_res = await self.session.execute(income_query)
        exp_res = await self.session.execute(expense_query)
        total_income = int(inc_res.scalar() or 0)
        total_expense = int(exp_res.scalar() or 0)
        net_savings = total_income - total_expense
        savings_rate = round((net_savings / total_income * 100), 1) if total_income > 0 else 0.0

        # Overall balance (all-time income - all-time expense)
        all_inc_query = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id, Transaction.type == TransactionType.INCOME
        )
        all_exp_query = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id, Transaction.type == TransactionType.EXPENSE
        )
        all_inc = int((await self.session.execute(all_inc_query)).scalar() or 0)
        all_exp = int((await self.session.execute(all_exp_query)).scalar() or 0)
        total_balance = all_inc - all_exp

        # Recent transactions (top 5)
        recent_txs, _ = await self.tx_repo.get_multi_with_filters(user_id, page=1, size=5)

        # Top spending categories for current month
        cat_query = (
            select(
                Transaction.category_id,
                Category.name,
                Category.icon,
                Category.color,
                func.sum(Transaction.amount_cents).label("total_cents"),
            )
            .join(Category, Transaction.category_id == Category.id)
            .where(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.EXPENSE,
                func.extract("month", Transaction.transaction_date) == current_month,
                func.extract("year", Transaction.transaction_date) == current_year,
            )
            .group_by(Transaction.category_id, Category.name, Category.icon, Category.color)
            .order_by(func.sum(Transaction.amount_cents).desc())
            .limit(5)
        )
        cat_res = await self.session.execute(cat_query)
        top_cats = []
        for row in cat_res.all():
            amt = int(row.total_cents)
            pct = round((amt / total_expense * 100), 1) if total_expense > 0 else 0.0
            top_cats.append(
                CategorySpend(
                    category_id=row.category_id,
                    name=row.name,
                    icon=row.icon,
                    color=row.color,
                    total_cents=amt,
                    percentage=pct,
                )
            )

        # Monthly cash flow (past 6 months)
        cash_flow = []
        for i in range(5, -1, -1):
            target_date = now - timedelta(days=i * 30)
            m = target_date.month
            y = target_date.year

            m_inc_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.INCOME,
                func.extract("month", Transaction.transaction_date) == m,
                func.extract("year", Transaction.transaction_date) == y,
            )
            m_exp_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.EXPENSE,
                func.extract("month", Transaction.transaction_date) == m,
                func.extract("year", Transaction.transaction_date) == y,
            )
            m_inc = int((await self.session.execute(m_inc_q)).scalar() or 0)
            m_exp = int((await self.session.execute(m_exp_q)).scalar() or 0)
            cash_flow.append(
                CashFlowPoint(
                    period=f"{month_name[m][:3]} {y}",
                    income_cents=m_inc,
                    expense_cents=m_exp,
                    net_cents=m_inc - m_exp,
                )
            )

        # Active budgets & savings goals
        budgets = await self.budget_repo.get_user_budgets(user_id, current_month, current_year)
        goals = await self.savings_repo.get_user_goals(user_id)

        return DashboardSummaryResponse(
            total_balance_cents=total_balance,
            total_income_cents=total_income,
            total_expense_cents=total_expense,
            net_savings_cents=net_savings,
            savings_rate=savings_rate,
            recent_transactions=recent_txs,
            top_spending_categories=top_cats,
            monthly_cash_flow=cash_flow,
            active_budgets=budgets,
            savings_goals=goals,
        )
