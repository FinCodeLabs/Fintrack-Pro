from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, BigInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class UserSettings(Base, TimestampMixin):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # Appearance
    theme: Mapped[str] = mapped_column(String(20), default="system")
    language: Mapped[str] = mapped_column(String(10), default="en")
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    currency: Mapped[str] = mapped_column(String(3), default="USD")

    # Display preferences
    date_format: Mapped[str] = mapped_column(String(20), default="MM/DD/YYYY")
    first_day_of_week: Mapped[int] = mapped_column(default=0)

    # Notification preferences
    notify_budget_exceeded: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_budget_warning: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_bill_reminders: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_savings_milestones: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_insights: Mapped[bool] = mapped_column(Boolean, default=True)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    push_notifications: Mapped[bool] = mapped_column(Boolean, default=True)

    # Dashboard preferences
    dashboard_widgets: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Privacy
    share_anonymous_data: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="settings")

    def __repr__(self) -> str:
        return f"<UserSettings(user_id={self.user_id}, theme='{self.theme}')>"
