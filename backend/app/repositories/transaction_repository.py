from datetime import date
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import Date, cast, func, select, and_, or_

from app.models.category import Category
from app.models.transaction import Transaction, TransactionType
from app.repositories.base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, session):
        super().__init__(Transaction, session)

    async def get_multi_with_filters(
        self,
        user_id: int,
        *,
        page: int = 1,
        size: int = 20,
        type_filter: str | None = None,
        category_id: int | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        min_amount: int | None = None,
        max_amount: int | None = None,
        search: str | None = None,
        sort_by: str = "transaction_date",
        sort_order: str = "desc",
    ) -> Tuple[List[Dict[str, Any]], int]:
        query = (
            select(
                Transaction,
                Category.name.label("category_name"),
                Category.icon.label("category_icon"),
                Category.color.label("category_color"),
            )
            .join(Category, Transaction.category_id == Category.id, isouter=True)
            .where(Transaction.user_id == user_id)
        )

        if type_filter and type_filter in ("income", "expense"):
            tx_type = TransactionType.INCOME if type_filter == "income" else TransactionType.EXPENSE
            query = query.where(Transaction.type == tx_type)

        if category_id is not None:
            query = query.where(Transaction.category_id == category_id)
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        if min_amount is not None:
            query = query.where(Transaction.amount_cents >= min_amount)
        if max_amount is not None:
            query = query.where(Transaction.amount_cents <= max_amount)

        if search:
            pattern = f"%{search}%"
            query = query.where(
                or_(
                    Transaction.description.ilike(pattern),
                    Transaction.note.ilike(pattern),
                    Category.name.ilike(pattern),
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar() or 0

        sort_column = getattr(Transaction, sort_by, Transaction.transaction_date)
        order_func = sort_column.desc() if sort_order == "desc" else sort_column.asc()
        query = query.order_by(order_func, Transaction.id.desc())

        offset = (page - 1) * size
        query = query.offset(offset).limit(size)

        result = await self.session.execute(query)
        rows = result.all()

        items = []
        for row in rows:
            tx = row[0] if hasattr(row, "__getitem__") else row.Transaction
            items.append({
                "id": tx.id,
                "user_id": tx.user_id,
                "category_id": tx.category_id,
                "amount_cents": tx.amount_cents,
                "type": tx.type.value if hasattr(tx.type, "value") else tx.type,
                "description": tx.description,
                "note": tx.note,
                "receipt_url": tx.receipt_url,
                "transaction_date": tx.transaction_date,
                "is_recurring": tx.is_recurring,
                "recurring_interval": tx.recurring_interval.value if hasattr(tx.recurring_interval, "value") else tx.recurring_interval,
                "location": tx.location,
                "created_at": tx.created_at,
                "updated_at": tx.updated_at,
                "category_name": getattr(row, "category_name", None),
                "category_icon": getattr(row, "category_icon", None),
                "category_color": getattr(row, "category_color", None),
            })

        return items, total

    async def _sum_by_type(
        self, user_id: int, tx_type: TransactionType, since: date, until: date
    ) -> int:
        query = select(func.coalesce(func.sum(Transaction.amount_cents), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == tx_type,
            Transaction.transaction_date >= since,
            Transaction.transaction_date < until,
        )
        result = await self.session.execute(query)
        return int(result.scalar())
