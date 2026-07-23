from pydantic import BaseModel
from app.schemas.dashboard import CategorySpend, CashFlowPoint


class IncomeVsExpense(BaseModel):
    period: str
    income_cents: int
    expense_cents: int


class CategoryDistribution(BaseModel):
    category_id: int | None
    name: str
    icon: str
    color: str
    total_cents: int
    count: int
    percentage: float


class AnalyticsOverviewResponse(BaseModel):
    period: str
    total_income_cents: int
    total_expense_cents: int
    net_savings_cents: int
    savings_rate: float
    income_vs_expense: list[IncomeVsExpense]
    category_breakdown: list[CategoryDistribution]
