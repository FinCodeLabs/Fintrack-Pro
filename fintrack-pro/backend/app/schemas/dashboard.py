from datetime import date
from pydantic import BaseModel
from app.schemas.transaction import TransactionResponse
from app.schemas.budget import BudgetResponse
from app.schemas.savings import SavingsGoalResponse


class CategorySpend(BaseModel):
    category_id: int | None
    name: str
    icon: str
    color: str
    total_cents: int
    percentage: float


class CashFlowPoint(BaseModel):
    period: str
    income_cents: int
    expense_cents: int
    net_cents: int


class DashboardSummaryResponse(BaseModel):
    total_balance_cents: int
    total_income_cents: int
    total_expense_cents: int
    net_savings_cents: int
    savings_rate: float
    recent_transactions: list[TransactionResponse]
    top_spending_categories: list[CategorySpend]
    monthly_cash_flow: list[CashFlowPoint]
    active_budgets: list[BudgetResponse]
    savings_goals: list[SavingsGoalResponse]
