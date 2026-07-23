from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Date, ForeignKey, String, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class GoalStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SavingsGoal(Base, TimestampMixin):
    __tablename__ = "savings_goals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    icon: Mapped[str] = mapped_column(String(50), default="🎯")

    target_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    current_cents: Mapped[int] = mapped_column(BigInteger, default=0)

    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[GoalStatus] = mapped_column(
        SAEnum(GoalStatus, name="goal_status"), default=GoalStatus.ACTIVE
    )

    monthly_contribution_cents: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    auto_save: Mapped[bool] = mapped_column(default=False)

    user: Mapped["User"] = relationship("User", back_populates="savings_goals")

    @property
    def progress_percentage(self) -> float:
        if self.target_cents == 0:
            return 0.0
        return round((self.current_cents / self.target_cents) * 100, 1)

    @property
    def remaining_cents(self) -> int:
        return max(0, self.target_cents - self.current_cents)
