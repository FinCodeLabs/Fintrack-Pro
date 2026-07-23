from typing import List, Optional
from sqlalchemy import select, func, and_
from app.models.budget import Budget
from app.models.category import Category
from app.repositories.base import BaseRepository


class BudgetRepository(BaseRepository[Budget]):
    def __init__(self, session):
        super().__init__(Budget, session)

    async def get_user_budgets(self, user_id: int, month: int, year: int) -> List[dict]:
        query = (
            select(
                Budget,
                Category.name.label("category_name"),
                Category.icon.label("category_icon"),
                Category.color.label("category_color"),
            )
            .join(Category, Budget.category_id == Category.id)
            .where(
                Budget.user_id == user_id,
                Budget.month == month,
                Budget.year == year,
            )
            .order_by(Category.name.asc())
        )
        result = await self.session.execute(query)
        rows = result.all()

        items = []
        for row in rows:
            b = row[0] if hasattr(row, "__getitem__") else row.Budget
            items.append({
                "id": b.id,
                "user_id": b.user_id,
                "category_id": b.category_id,
                "month": b.month,
                "year": b.year,
                "limit_cents": b.limit_cents,
                "spent_cents": b.spent_cents,
                "remaining_cents": b.remaining_cents,
                "usage_percentage": b.usage_percentage,
                "is_exceeded": b.is_exceeded,
                "alert_threshold": b.alert_threshold,
                "created_at": b.created_at,
                "updated_at": b.updated_at,
                "category_name": getattr(row, "category_name", None),
                "category_icon": getattr(row, "category_icon", None),
                "category_color": getattr(row, "category_color", None),
            })
        return items

    async def get_by_category_and_period(
        self, user_id: int, category_id: int, month: int, year: int
    ) -> Optional[Budget]:
        query = select(Budget).where(
            Budget.user_id == user_id,
            Budget.category_id == category_id,
            Budget.month == month,
            Budget.year == year,
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
