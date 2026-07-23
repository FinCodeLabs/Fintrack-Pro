from typing import List, Optional
from sqlalchemy import select
from app.models.savings_goal import SavingsGoal
from app.repositories.base import BaseRepository


class SavingsRepository(BaseRepository[SavingsGoal]):
    def __init__(self, session):
        super().__init__(SavingsGoal, session)

    async def get_user_goals(self, user_id: int) -> List[SavingsGoal]:
        query = (
            select(SavingsGoal)
            .where(SavingsGoal.user_id == user_id)
            .order_by(SavingsGoal.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
