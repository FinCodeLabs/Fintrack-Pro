from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.schemas.common import APIResponse
from app.schemas.insight import FinancialInsightResponse, InsightGenerateResponse
from app.services.insight_service import InsightService

router = APIRouter(prefix="/insights", tags=["Financial Insights"])


@router.get("", response_model=APIResponse[List[FinancialInsightResponse]])
async def list_insights(
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = InsightService(session)
    insights = await service.list_insights(current_user.id)
    return APIResponse.ok(data=[FinancialInsightResponse.model_validate(i) for i in insights])


@router.post("/generate", response_model=APIResponse[InsightGenerateResponse])
async def generate_insights(
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = InsightService(session)
    cnt = await service.generate_insights(current_user.id)
    return APIResponse.ok(
        data=InsightGenerateResponse(insights_count=cnt, message=f"Generated {cnt} new financial insights.")
    )
