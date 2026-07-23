from datetime import date
from typing import Tuple, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundException
from app.models.transaction import Transaction, TransactionType, RecurringInterval
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionFilter


class TransactionService:
    def __init__(self, session: AsyncSession):
        self.repo = TransactionRepository(session)
        self.session = session

    async def list_transactions(
        self, user_id: int, filters: TransactionFilter, page: int = 1, size: int = 20
    ) -> Tuple[List[Dict[str, Any]], int]:
        return await self.repo.get_multi_with_filters(
            user_id,
            page=page,
            size=size,
            type_filter=filters.type,
            category_id=filters.category_id,
            start_date=filters.start_date,
            end_date=filters.end_date,
            min_amount=filters.min_amount,
            max_amount=filters.max_amount,
            search=filters.search,
        )

    async def get_transaction(self, tx_id: int, user_id: int) -> Transaction:
        tx = await self.repo.get_by_id(tx_id)
        if not tx or tx.user_id != user_id:
            raise NotFoundException("Transaction", tx_id)
        return tx

    async def create_transaction(self, user_id: int, data: TransactionCreate) -> Transaction:
        tx_type = TransactionType.INCOME if data.type == "income" else TransactionType.EXPENSE
        rec_int = RecurringInterval(data.recurring_interval) if data.recurring_interval in [e.value for e in RecurringInterval] else RecurringInterval.NONE

        tx = Transaction(
            user_id=user_id,
            category_id=data.category_id,
            amount_cents=data.amount_cents,
            type=tx_type,
            description=data.description,
            note=data.note,
            transaction_date=data.transaction_date,
            location=data.location,
            is_recurring=data.is_recurring,
            recurring_interval=rec_int,
        )
        self.session.add(tx)
        await self.session.flush()
        return tx

    async def update_transaction(
        self, tx_id: int, user_id: int, data: TransactionUpdate
    ) -> Transaction:
        tx = await self.get_transaction(tx_id, user_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, val in update_data.items():
            if val is not None:
                setattr(tx, field, val)
        await self.session.flush()
        return tx

    async def delete_transaction(self, tx_id: int, user_id: int) -> None:
        tx = await self.get_transaction(tx_id, user_id)
        await self.session.delete(tx)
        await self.session.flush()
