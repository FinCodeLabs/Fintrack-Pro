from datetime import datetime
from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    category_id: int
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2020, le=2100)
    limit_cents: int = Field(..., gt=0)
    alert_threshold: int = Field(80, ge=1, le=100)


class BudgetUpdate(BaseModel):
    limit_cents: int | None = Field(None, gt=0)
    alert_threshold: int | None = Field(None, ge=1, le=100)


class BudgetResponse(BaseModel):
    id: int
    user_id: int
    category_id: int
    month: int
    year: int
    limit_cents: int
    spent_cents: int
    remaining_cents: int
    usage_percentage: float
    is_exceeded: bool
    alert_threshold: int
    created_at: datetime
    updated_at: datetime

    category_name: str | None = None
    category_icon: str | None = None
    category_color: str | None = None

    model_config = {"from_attributes": True}
