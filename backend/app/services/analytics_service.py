from datetime import datetime, timedelta
from calendar import month_name
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.transaction import Transaction, TransactionType
from app.schemas.analytics import AnalyticsOverviewResponse, IncomeVsExpense, CategoryDistribution


class AnalyticsService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_analytics(self, user_id: int, period: str = "this_month") -> AnalyticsOverviewResponse:
        now = datetime.now()
        current_month = now.month
        current_year = now.year

        # Total income & total expense
        inc_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.INCOME,
            func.extract("month", Transaction.transaction_date) == current_month,
            func.extract("year", Transaction.transaction_date) == current_year,
        )
        exp_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            func.extract("month", Transaction.transaction_date) == current_month,
            func.extract("year", Transaction.transaction_date) == current_year,
        )

        total_income = int((await self.session.execute(inc_q)).scalar() or 0)
        total_expense = int((await self.session.execute(exp_q)).scalar() or 0)
        net_savings = total_income - total_expense
        savings_rate = round((net_savings / total_income * 100), 1) if total_income > 0 else 0.0

        # Income vs Expense history (6 months)
        history = []
        for i in range(5, -1, -1):
            dt = now - timedelta(days=i * 30)
            m, y = dt.month, dt.year
            m_inc = int((await self.session.execute(
                select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.INCOME,
                    func.extract("month", Transaction.transaction_date) == m,
                    func.extract("year", Transaction.transaction_date) == y,
                )
            )).scalar() or 0)
            m_exp = int((await self.session.execute(
                select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.EXPENSE,
                    func.extract("month", Transaction.transaction_date) == m,
                    func.extract("year", Transaction.transaction_date) == y,
                )
            )).scalar() or 0)
            history.append(IncomeVsExpense(period=f"{month_name[m][:3]} {y}", income_cents=m_inc, expense_cents=m_exp))

        # Category distribution
        cat_q = (
            select(
                Transaction.category_id,
                Category.name,
                Category.icon,
                Category.color,
                func.sum(Transaction.amount_cents).label("total"),
                func.count(Transaction.id).label("cnt"),
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
        )
        res = await self.session.execute(cat_q)
        distribution = []
        for r in res.all():
            tot = int(r.total)
            pct = round((tot / total_expense * 100), 1) if total_expense > 0 else 0.0
            distribution.append(
                CategoryDistribution(
                    category_id=r.category_id,
                    name=r.name,
                    icon=r.icon,
                    color=r.color,
                    total_cents=tot,
                    count=r.cnt,
                    percentage=pct,
                )
            )

        return AnalyticsOverviewResponse(
            period=f"{month_name[current_month]} {current_year}",
            total_income_cents=total_income,
            total_expense_cents=total_expense,
            net_savings_cents=net_savings,
            savings_rate=savings_rate,
            income_vs_expense=history,
            category_breakdown=distribution,
        )
