from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class TransactionBase(BaseModel):
    amount_cents: int = Field(..., gt=0, description="Amount in cents (e.g., $10.50 = 1050)")
    type: str = Field(..., pattern="^(income|expense)$")
    category_id: int | None = None
    description: str | None = Field(None, max_length=500)
    note: str | None = None
    transaction_date: date
    location: str | None = None
    is_recurring: bool = False
    recurring_interval: str = "none"


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount_cents: int | None = Field(None, gt=0)
    category_id: int | None = None
    description: str | None = Field(None, max_length=500)
    note: str | None = None
    transaction_date: date | None = None
    location: str | None = None


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    category_id: int | None
    amount_cents: int
    type: str
    description: str | None
    note: str | None
    receipt_url: str | None
    transaction_date: date
    is_recurring: bool
    recurring_interval: str
    location: str | None
    created_at: datetime
    updated_at: datetime

    category_name: str | None = None
    category_icon: str | None = None
    category_color: str | None = None

    model_config = {"from_attributes": True}


class TransactionFilter(BaseModel):
    type: str | None = Field(None, pattern="^(income|expense)$")
    category_id: int | None = None
    start_date: date | None = None
    end_date: date | None = None
    min_amount: int | None = Field(None, ge=0)
    max_amount: int | None = Field(None, ge=0)
    search: str | None = None
    is_recurring: bool | None = None
