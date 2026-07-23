from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.schemas.common import APIResponse
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=APIResponse[DashboardSummaryResponse])
async def get_dashboard_summary(
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = DashboardService(session)
    summary = await service.get_summary(current_user.id)
    return APIResponse.ok(data=summary)
