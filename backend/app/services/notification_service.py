from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository


class NotificationService:
    def __init__(self, session: AsyncSession):
        self.repo = NotificationRepository(session)
        self.session = session

    async def list_notifications(self, user_id: int, unread_only: bool = False) -> List[Notification]:
        return await self.repo.get_user_notifications(user_id, unread_only)

    async def mark_all_read(self, user_id: int) -> None:
        await self.repo.mark_all_as_read(user_id)
        await self.session.flush()
