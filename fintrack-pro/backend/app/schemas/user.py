from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    avatar_url: str | None
    is_verified: bool
    is_2fa_enabled: bool
    is_onboarding_completed: bool
    default_currency: str
    timezone: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    avatar_url: str | None = None
    default_currency: str | None = Field(None, min_length=3, max_length=3)
    timezone: str | None = None


UserUpdate = UserProfileUpdate


class UserSettingsResponse(BaseModel):
    theme: str
    language: str
    timezone: str
    currency: str
    date_format: str
    first_day_of_week: int
    notify_budget_exceeded: bool
    notify_budget_warning: bool
    notify_bill_reminders: bool
    notify_savings_milestones: bool
    notify_insights: bool
    email_notifications: bool
    push_notifications: bool

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    theme: str | None = None
    language: str | None = None
    timezone: str | None = None
    currency: str | None = None
    date_format: str | None = None
    first_day_of_week: int | None = None
    notify_budget_exceeded: bool | None = None
    notify_budget_warning: bool | None = None
    notify_bill_reminders: bool | None = None
    notify_savings_milestones: bool | None = None
    notify_insights: bool | None = None
    email_notifications: bool | None = None
    push_notifications: bool | None = None
