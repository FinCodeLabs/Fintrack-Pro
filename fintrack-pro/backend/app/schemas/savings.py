from datetime import date, datetime
from pydantic import BaseModel, Field


class SavingsGoalCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=500)
    icon: str = "🎯"
    target_cents: int = Field(..., gt=0)
    current_cents: int = Field(0, ge=0)
    deadline: date | None = None
    monthly_contribution_cents: int | None = None
    auto_save: bool = False


class SavingsGoalUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    icon: str | None = None
    target_cents: int | None = Field(None, gt=0)
    current_cents: int | None = Field(None, ge=0)
    deadline: date | None = None
    monthly_contribution_cents: int | None = None
    auto_save: bool | None = None
    status: str | None = None


class SavingsGoalResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None
    icon: str
    target_cents: int
    current_cents: int
    remaining_cents: int
    progress_percentage: float
    deadline: date | None
    status: str
    monthly_contribution_cents: int | None
    auto_save: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
