from typing import List, Optional

from sqlalchemy import select

from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, session):
        super().__init__(Category, session)

    async def get_system_categories(self, type: str | None = None) -> List[Category]:
        query = select(Category).where(Category.is_system == True)
        if type:
            query = query.where(Category.type == type)
        query = query.order_by(Category.sort_order, Category.name)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_user_categories(self, user_id: int, type: str | None = None) -> List[Category]:
        query = select(Category).where(
            Category.user_id == user_id,
            Category.is_system == False,
        )
        if type:
            query = query.where(Category.type == type)
        query = query.order_by(Category.sort_order, Category.name)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_merged_categories(self, user_id: int, type: str | None = None) -> List[Category]:
        query = select(Category).where(
            (Category.is_system == True) | (Category.user_id == user_id)
        )
        if type:
            query = query.where(Category.type == type)
        query = query.order_by(Category.sort_order, Category.name)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_user(self, category_id: int, user_id: int) -> Optional[Category]:
        query = select(Category).where(
            Category.id == category_id,
            (Category.user_id == user_id) | (Category.is_system == True),
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_owned_by_user(self, category_id: int, user_id: int) -> Optional[Category]:
        query = select(Category).where(
            Category.id == category_id,
            Category.user_id == user_id,
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
