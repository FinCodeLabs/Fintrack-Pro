from datetime import date
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.schemas.common import APIResponse, PaginationMeta
from app.schemas.transaction import (
    TransactionCreate,
    TransactionFilter,
    TransactionResponse,
    TransactionUpdate,
)
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=APIResponse[List[TransactionResponse]])
async def list_transactions(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    type: str | None = Query(None, pattern="^(income|expense)$"),
    category_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    search: str | None = None,
    current_user: CurrentUser = None,
    session: AsyncSession = Depends(get_db_session),
):
    filters = TransactionFilter(
        type=type,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )
    service = TransactionService(session)
    items, total = await service.list_transactions(current_user.id, filters, page=page, size=size)
    meta = PaginationMeta.compute(page, size, total)
    responses = [TransactionResponse.model_validate(item) for item in items]
    return APIResponse.ok(data=responses, meta=meta)


@router.post("", response_model=APIResponse[TransactionResponse])
async def create_transaction(
    data: TransactionCreate,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = TransactionService(session)
    tx = await service.create_transaction(current_user.id, data)
    return APIResponse.ok(data=TransactionResponse.model_validate(tx))


@router.get("/{tx_id}", response_model=APIResponse[TransactionResponse])
async def get_transaction(
    tx_id: int,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = TransactionService(session)
    tx = await service.get_transaction(tx_id, current_user.id)
    return APIResponse.ok(data=TransactionResponse.model_validate(tx))


@router.patch("/{tx_id}", response_model=APIResponse[TransactionResponse])
async def update_transaction(
    tx_id: int,
    data: TransactionUpdate,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = TransactionService(session)
    tx = await service.update_transaction(tx_id, current_user.id, data)
    return APIResponse.ok(data=TransactionResponse.model_validate(tx))


@router.delete("/{tx_id}")
async def delete_transaction(
    tx_id: int,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = TransactionService(session)
    await service.delete_transaction(tx_id, current_user.id)
    return APIResponse.ok(data={"message": "Transaction deleted successfully"})
