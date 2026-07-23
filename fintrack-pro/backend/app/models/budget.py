from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.user import User


class Budget(Base, TimestampMixin):
    __tablename__ = "budgets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )

    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    # Budget limit in cents
    limit_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    # Cached spent amount for performance
    spent_cents: Mapped[int] = mapped_column(BigInteger, default=0)

    # Alert threshold (percentage)
    alert_threshold: Mapped[int] = mapped_column(Integer, default=80)

    __table_args__ = (
        UniqueConstraint(
            "user_id", "category_id", "month", "year",
            name="uq_user_category_month_year"
        ),
    )

    user: Mapped["User"] = relationship("User", back_populates="budgets")
    category: Mapped["Category"] = relationship("Category", back_populates="budgets")

    @property
    def remaining_cents(self) -> int:
        return max(0, self.limit_cents - self.spent_cents)

    @property
    def usage_percentage(self) -> float:
        if self.limit_cents == 0:
            return 0.0
        return round((self.spent_cents / self.limit_cents) * 100, 1)

    @property
    def is_exceeded(self) -> bool:
        return self.spent_cents > self.limit_cents
