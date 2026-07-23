from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.common import APIResponse
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=APIResponse[List[CategoryResponse]])
async def list_categories(
    type: str | None = Query(None, pattern="^(income|expense)$"),
    current_user: CurrentUser = None,
    session: AsyncSession = Depends(get_db_session),
):
    service = CategoryService(session)
    user_id = current_user.id if current_user else 0
    categories = await service.list_categories(user_id, type)
    return APIResponse.ok(data=[CategoryResponse.model_validate(c) for c in categories])


@router.post("", response_model=APIResponse[CategoryResponse])
async def create_category(
    data: CategoryCreate,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = CategoryService(session)
    cat = await service.create_category(current_user.id, data)
    return APIResponse.ok(data=CategoryResponse.model_validate(cat))


@router.patch("/{category_id}", response_model=APIResponse[CategoryResponse])
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = CategoryService(session)
    cat = await service.update_category(category_id, current_user.id, data)
    return APIResponse.ok(data=CategoryResponse.model_validate(cat))


@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = CategoryService(session)
    await service.delete_category(category_id, current_user.id)
    return APIResponse.ok(data={"message": "Category deleted successfully"})
