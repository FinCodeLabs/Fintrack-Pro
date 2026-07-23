from datetime import datetime
from pydantic import BaseModel, Field


class CategoryResponse(BaseModel):
    id: int
    name: str
    icon: str
    color: str
    type: str
    is_system: bool
    sort_order: int

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: str = "📦"
    color: str = "#6B7280"
    type: str = Field(..., pattern="^(income|expense)$")
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    icon: str | None = None
    color: str | None = None
    sort_order: int | None = None
