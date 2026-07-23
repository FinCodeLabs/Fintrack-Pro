from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundException
from app.models.savings_goal import SavingsGoal
from app.repositories.savings_repository import SavingsRepository
from app.schemas.savings import SavingsGoalCreate, SavingsGoalUpdate


class SavingsService:
    def __init__(self, session: AsyncSession):
        self.repo = SavingsRepository(session)
        self.session = session

    async def list_goals(self, user_id: int) -> List[SavingsGoal]:
        return await self.repo.get_user_goals(user_id)

    async def create_goal(self, user_id: int, data: SavingsGoalCreate) -> SavingsGoal:
        goal = SavingsGoal(
            user_id=user_id,
            name=data.name,
            description=data.description,
            icon=data.icon,
            target_cents=data.target_cents,
            current_cents=data.current_cents,
            deadline=data.deadline,
            monthly_contribution_cents=data.monthly_contribution_cents,
            auto_save=data.auto_save,
        )
        self.session.add(goal)
        await self.session.flush()
        return goal

    async def update_goal(
        self, goal_id: int, user_id: int, data: SavingsGoalUpdate
    ) -> SavingsGoal:
        goal = await self.repo.get_by_id(goal_id)
        if not goal or goal.user_id != user_id:
            raise NotFoundException("SavingsGoal", goal_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, val in update_data.items():
            if val is not None:
                setattr(goal, field, val)
        await self.session.flush()
        return goal

    async def deposit(self, goal_id: int, user_id: int, amount_cents: int) -> SavingsGoal:
        goal = await self.repo.get_by_id(goal_id)
        if not goal or goal.user_id != user_id:
            raise NotFoundException("SavingsGoal", goal_id)
        goal.current_cents += amount_cents
        if goal.current_cents >= goal.target_cents:
            goal.status = "completed"
        await self.session.flush()
        return goal

    async def withdraw(self, goal_id: int, user_id: int, amount_cents: int) -> SavingsGoal:
        goal = await self.repo.get_by_id(goal_id)
        if not goal or goal.user_id != user_id:
            raise NotFoundException("SavingsGoal", goal_id)
        goal.current_cents = max(0, goal.current_cents - amount_cents)
        if goal.current_cents < goal.target_cents and goal.status == "completed":
            goal.status = "active"
        await self.session.flush()
        return goal

    async def delete_goal(self, goal_id: int, user_id: int) -> None:
        goal = await self.repo.get_by_id(goal_id)
        if not goal or goal.user_id != user_id:
            raise NotFoundException("SavingsGoal", goal_id)
        await self.session.delete(goal)
        await self.session.flush()
