from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int
    size: int
    total: int
    pages: int

    @classmethod
    def compute(cls, page: int, size: int, total: int) -> "PaginationMeta":
        pages = (total + size - 1) // size if size > 0 else 0
        return cls(page=page, size=size, total=total, pages=pages)


class APIResponse(BaseModel, Generic[T]):
    """Standard API response envelope."""
    success: bool = True
    data: T | None = None
    meta: PaginationMeta | None = None
    error: dict[str, str] | None = None

    @classmethod
    def ok(cls, data: T, meta: PaginationMeta | None = None) -> "APIResponse[T]":
        return cls(success=True, data=data, meta=meta)

    @classmethod
    def error_response(cls, code: str, message: str) -> "APIResponse[None]":
        return cls(success=False, data=None, error={"code": code, "message": message})


class PaginatedParams(BaseModel):
    page: int = 1
    size: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size

    @property
    def limit(self) -> int:
        return self.size
