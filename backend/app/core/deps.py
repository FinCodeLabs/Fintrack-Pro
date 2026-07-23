from typing import Annotated

from fastapi import Depends, Header
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_token
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    session: AsyncSession = Depends(get_db_session),
):
    """Dependency that extracts and validates the current user from JWT."""
    if not authorization:
        raise UnauthorizedException("Missing authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise UnauthorizedException("Invalid authorization scheme")

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise UnauthorizedException("Invalid token type")
        user_id: str = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token payload")
    except JWTError:
        raise UnauthorizedException("Token expired or invalid")

    repo = UserRepository(session)
    service = UserService(repo)
    user = await service.get_by_id(int(user_id))
    if not user:
        raise UnauthorizedException("User not found")
    if not user.is_active:
        raise UnauthorizedException("Account is deactivated")

    return user


CurrentUser = Annotated[UserService, Depends(get_current_user)]
DBSession = Annotated[AsyncSession, Depends(get_db_session)]
