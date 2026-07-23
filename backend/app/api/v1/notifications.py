from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.schemas.common import APIResponse
from app.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=APIResponse[List[NotificationResponse]])
async def list_notifications(
    unread_only: bool = Query(False),
    current_user: CurrentUser = None,
    session: AsyncSession = Depends(get_db_session),
):
    service = NotificationService(session)
    nots = await service.list_notifications(current_user.id, unread_only=unread_only)
    return APIResponse.ok(data=[NotificationResponse.model_validate(n) for n in nots])


@router.post("/read-all", response_model=APIResponse[dict])
async def mark_all_read(
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = NotificationService(session)
    await service.mark_all_read(current_user.id)
    return APIResponse.ok(data={"message": "All notifications marked as read."})
