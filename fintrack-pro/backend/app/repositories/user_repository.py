from typing import Optional

from sqlalchemy import select

from app.models.user import User
from app.models.user_settings import UserSettings
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        query = select(User).where(User.email == email)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_reset_token(self, token: str) -> Optional[User]:
        query = select(User).where(User.reset_password_token == token)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_verification_token(self, token: str) -> Optional[User]:
        query = select(User).where(User.email_verification_token == token)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create_user_settings(self, user_id: int) -> UserSettings:
        settings = UserSettings(user_id=user_id)
        self.session.add(settings)
        await self.session.flush()
        return settings

    async def get_user_settings(self, user_id: int) -> Optional[UserSettings]:
        query = select(UserSettings).where(UserSettings.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
