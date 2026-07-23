from typing import List
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.financial_insight import FinancialInsight
from app.models.transaction import Transaction, TransactionType
from app.repositories.insight_repository import InsightRepository
from app.schemas.insight import FinancialInsightResponse


class InsightService:
    def __init__(self, session: AsyncSession):
        self.repo = InsightRepository(session)
        self.session = session

    async def list_insights(self, user_id: int) -> List[FinancialInsight]:
        insights = await self.repo.get_user_insights(user_id)
        if not insights:
            # Generate default smart insights if none exist
            await self.generate_insights(user_id)
            insights = await self.repo.get_user_insights(user_id)
        return insights

    async def generate_insights(self, user_id: int) -> int:
        now = datetime.now()

        # Check total income vs expense
        inc_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id, Transaction.type == TransactionType.INCOME
        )
        exp_q = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id, Transaction.type == TransactionType.EXPENSE
        )
        inc = int((await self.session.execute(inc_q)).scalar() or 0)
        exp = int((await self.session.execute(exp_q)).scalar() or 0)

        created_count = 0
        if inc > 0 and exp > 0:
            savings_rate = round(((inc - exp) / inc * 100), 1)
            if savings_rate >= 20:
                i1 = FinancialInsight(
                    user_id=user_id,
                    category="savings",
                    title="High Savings Rate!",
                    message=f"Great job! You saved {savings_rate}% of your income this period, exceeding the recommended 20% benchmark.",
                    severity="info",
                    generated_at=now,
                )
                self.session.add(i1)
                created_count += 1
            else:
                i1 = FinancialInsight(
                    user_id=user_id,
                    category="budget",
                    title="Opportunity to Increase Savings",
                    message=f"Your current savings rate is {savings_rate}%. Aim to reduce discretionary spending by 5-10% to build a stronger emergency buffer.",
                    severity="warning",
                    generated_at=now,
                )
                self.session.add(i1)
                created_count += 1

        i2 = FinancialInsight(
            user_id=user_id,
            category="tip",
            title="Automate Emergency Savings Goal",
            message="Setting up automatic monthly contributions to your Savings Goal increases goal completion rates by over 60%.",
            severity="info",
            generated_at=now,
        )
        self.session.add(i2)
        created_count += 1

        await self.session.flush()
        return created_count
