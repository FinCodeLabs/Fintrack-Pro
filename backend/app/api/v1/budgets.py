from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetUpdate
from app.schemas.common import APIResponse
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("", response_model=APIResponse[List[BudgetResponse]])
async def list_budgets(
    month: int = Query(datetime.now().month, ge=1, le=12),
    year: int = Query(datetime.now().year, ge=2020, le=2100),
    current_user: CurrentUser = None,
    session: AsyncSession = Depends(get_db_session),
):
    service = BudgetService(session)
    items = await service.list_budgets(current_user.id, month, year)
    return APIResponse.ok(data=[BudgetResponse.model_validate(item) for item in items])


@router.post("", response_model=APIResponse[BudgetResponse])
async def create_budget(
    data: BudgetCreate,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = BudgetService(session)
    b = await service.create_budget(current_user.id, data)
    return APIResponse.ok(data=BudgetResponse.model_validate(b))


@router.patch("/{budget_id}", response_model=APIResponse[BudgetResponse])
async def update_budget(
    budget_id: int,
    data: BudgetUpdate,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = BudgetService(session)
    b = await service.update_budget(budget_id, current_user.id, data)
    return APIResponse.ok(data=BudgetResponse.model_validate(b))


@router.delete("/{budget_id}")
async def delete_budget(
    budget_id: int,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = BudgetService(session)
    await service.delete_budget(budget_id, current_user.id)
    return APIResponse.ok(data={"message": "Budget deleted successfully"})
