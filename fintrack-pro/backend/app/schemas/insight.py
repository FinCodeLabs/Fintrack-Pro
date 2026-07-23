from datetime import datetime
from pydantic import BaseModel


class FinancialInsightResponse(BaseModel):
    id: int
    user_id: int
    category: str
    title: str
    message: str
    severity: str
    is_read: bool
    generated_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class InsightGenerateResponse(BaseModel):
    insights_count: int
    message: str
