from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.schemas.common import APIResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=APIResponse[UserResponse])
async def get_current_user_profile(current_user: CurrentUser):
    return APIResponse.ok(data=UserResponse.model_validate(current_user))


@router.patch("/me", response_model=APIResponse[UserResponse])
async def update_user_profile(
    data: UserUpdate,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = UserService(session)
    updated = await service.update_profile(current_user.id, data)
    return APIResponse.ok(data=UserResponse.model_validate(updated))
