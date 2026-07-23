from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    def __init__(self, session: AsyncSession):
        self.repo = CategoryRepository(session)

    async def list_categories(
        self, user_id: int, type: str | None = None
    ) -> List[Category]:
        """Get all categories available to the user (system + custom)."""
        return await self.repo.get_merged_categories(user_id, type)

    async def get_category(self, category_id: int, user_id: int) -> Category:
        """Get a single category (must be system or owned by user)."""
        category = await self.repo.get_by_user(category_id, user_id)
        if not category:
            raise NotFoundException("Category", category_id)
        return category

    async def create_category(self, user_id: int, data: CategoryCreate) -> Category:
        """Create a custom category for a user."""
        category = await self.repo.create(
            name=data.name,
            icon=data.icon,
            color=data.color,
            type=data.type,
            user_id=user_id,
            is_system=False,
            sort_order=data.sort_order,
        )
        return category

    async def update_category(
        self, category_id: int, user_id: int, data: CategoryUpdate
    ) -> Category:
        """Update a user's custom category. Cannot update system categories."""
        category = await self.repo.get_owned_by_user(category_id, user_id)
        if not category:
            raise NotFoundException("Category", category_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(category, field, value)

        await self.repo.session.flush()
        return category

    async def delete_category(self, category_id: int, user_id: int) -> None:
        """Delete a user's custom category. Cannot delete system categories."""
        category = await self.repo.get_owned_by_user(category_id, user_id)
        if not category:
            raise NotFoundException("Category", category_id)
        await self.repo.session.delete(category)
        await self.repo.session.flush()
