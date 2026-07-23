import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    Date,
    DateTime,
    ForeignKey,
    String,
    Text,
    Boolean,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.user import User


class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class RecurringInterval(str, enum.Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Money stored as integer cents
    amount_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    type: Mapped[TransactionType] = mapped_column(
        SAEnum(TransactionType, name="transaction_type"), nullable=False, index=True
    )

    # Details
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    receipt_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    # Recurring
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    recurring_interval: Mapped[RecurringInterval] = mapped_column(
        SAEnum(RecurringInterval, name="recurring_interval"), default=RecurringInterval.NONE
    )
    recurring_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Location (optional)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="transactions")
    category: Mapped["Category | None"] = relationship("Category", back_populates="transactions")

    @property
    def amount_decimal(self) -> Decimal:
        """Convert cents to decimal for display."""
        return Decimal(str(self.amount_cents)) / Decimal("100")

    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, amount={self.amount_cents}¢, type='{self.type.value}')>"
