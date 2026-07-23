from typing import List
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.schemas.common import APIResponse
from app.schemas.savings import SavingsGoalCreate, SavingsGoalResponse, SavingsGoalUpdate
from app.services.savings_service import SavingsService

router = APIRouter(prefix="/savings", tags=["Savings Goals"])


@router.get("", response_model=APIResponse[List[SavingsGoalResponse]])
async def list_goals(
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = SavingsService(session)
    goals = await service.list_goals(current_user.id)
    return APIResponse.ok(data=[SavingsGoalResponse.model_validate(g) for g in goals])


@router.post("", response_model=APIResponse[SavingsGoalResponse])
async def create_goal(
    data: SavingsGoalCreate,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = SavingsService(session)
    g = await service.create_goal(current_user.id, data)
    return APIResponse.ok(data=SavingsGoalResponse.model_validate(g))


@router.patch("/{goal_id}", response_model=APIResponse[SavingsGoalResponse])
async def update_goal(
    goal_id: int,
    data: SavingsGoalUpdate,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = SavingsService(session)
    g = await service.update_goal(goal_id, current_user.id, data)
    return APIResponse.ok(data=SavingsGoalResponse.model_validate(g))


@router.post("/{goal_id}/deposit", response_model=APIResponse[SavingsGoalResponse])
async def deposit_to_goal(
    goal_id: int,
    amount_cents: int = Body(..., embed=True, gt=0),
    current_user: CurrentUser = None,
    session: AsyncSession = Depends(get_db_session),
):
    service = SavingsService(session)
    g = await service.deposit(goal_id, current_user.id, amount_cents)
    return APIResponse.ok(data=SavingsGoalResponse.model_validate(g))


@router.post("/{goal_id}/withdraw", response_model=APIResponse[SavingsGoalResponse])
async def withdraw_from_goal(
    goal_id: int,
    amount_cents: int = Body(..., embed=True, gt=0),
    current_user: CurrentUser = None,
    session: AsyncSession = Depends(get_db_session),
):
    service = SavingsService(session)
    g = await service.withdraw(goal_id, current_user.id, amount_cents)
    return APIResponse.ok(data=SavingsGoalResponse.model_validate(g))


@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: int,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = SavingsService(session)
    await service.delete_goal(goal_id, current_user.id)
    return APIResponse.ok(data={"message": "Savings goal deleted successfully"})
