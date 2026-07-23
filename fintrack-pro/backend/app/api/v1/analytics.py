from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.schemas.analytics import AnalyticsOverviewResponse
from app.schemas.common import APIResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=APIResponse[AnalyticsOverviewResponse])
async def get_analytics_overview(
    period: str = Query("this_month"),
    current_user: CurrentUser = None,
    session: AsyncSession = Depends(get_db_session),
):
    service = AnalyticsService(session)
    analytics = await service.get_analytics(current_user.id, period=period)
    return APIResponse.ok(data=analytics)
