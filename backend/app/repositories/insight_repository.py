from typing import List
from sqlalchemy import select
from app.models.financial_insight import FinancialInsight
from app.repositories.base import BaseRepository


class InsightRepository(BaseRepository[FinancialInsight]):
    def __init__(self, session):
        super().__init__(FinancialInsight, session)

    async def get_user_insights(self, user_id: int) -> List[FinancialInsight]:
        query = (
            select(FinancialInsight)
            .where(FinancialInsight.user_id == user_id)
            .order_by(FinancialInsight.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
