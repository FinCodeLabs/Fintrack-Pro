from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundException
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate


class UserService:
    def __init__(self, session: AsyncSession):
        self.repo = UserRepository(session)
        self.session = session

    async def get_user_by_id(self, user_id: int) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User", user_id)
        return user

    async def update_profile(self, user_id: int, data: UserUpdate) -> User:
        user = await self.get_user_by_id(user_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, val in update_data.items():
            if val is not None:
                setattr(user, field, val)
        await self.session.flush()
        return user
