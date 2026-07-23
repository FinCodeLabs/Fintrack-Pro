from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundException, BadRequestException
from app.models.budget import Budget
from app.models.transaction import Transaction, TransactionType
from app.repositories.budget_repository import BudgetRepository
from app.schemas.budget import BudgetCreate, BudgetUpdate


class BudgetService:
    def __init__(self, session: AsyncSession):
        self.repo = BudgetRepository(session)
        self.session = session

    async def list_budgets(self, user_id: int, month: int, year: int) -> List[dict]:
        budgets = await self.repo.get_user_budgets(user_id, month, year)
        # Recalculate spent cents dynamically
        for b in budgets:
            query = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
                Transaction.user_id == user_id,
                Transaction.category_id == b["category_id"],
                Transaction.type == TransactionType.EXPENSE,
                func.extract("month", Transaction.transaction_date) == month,
                func.extract("year", Transaction.transaction_date) == year,
            )
            res = await self.session.execute(query)
            spent = int(res.scalar() or 0)
            b["spent_cents"] = spent
            b["remaining_cents"] = max(0, b["limit_cents"] - spent)
            b["usage_percentage"] = round((spent / b["limit_cents"] * 100), 1) if b["limit_cents"] > 0 else 0.0
            b["is_exceeded"] = spent > b["limit_cents"]
        return budgets

    async def create_budget(self, user_id: int, data: BudgetCreate) -> Budget:
        existing = await self.repo.get_by_category_and_period(
            user_id, data.category_id, data.month, data.year
        )
        if existing:
            raise BadRequestException("Budget for this category and month already exists.")

        budget = Budget(
            user_id=user_id,
            category_id=data.category_id,
            month=data.month,
            year=data.year,
            limit_cents=data.limit_cents,
            alert_threshold=data.alert_threshold,
        )
        self.session.add(budget)
        await self.session.flush()
        return budget

    async def update_budget(
        self, budget_id: int, user_id: int, data: BudgetUpdate
    ) -> Budget:
        budget = await self.repo.get_by_id(budget_id)
        if not budget or budget.user_id != user_id:
            raise NotFoundException("Budget", budget_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, val in update_data.items():
            if val is not None:
                setattr(budget, field, val)
        await self.session.flush()
        return budget

    async def delete_budget(self, budget_id: int, user_id: int) -> None:
        budget = await self.repo.get_by_id(budget_id)
        if not budget or budget.user_id != user_id:
            raise NotFoundException("Budget", budget_id)
        await self.session.delete(budget)
        await self.session.flush()
