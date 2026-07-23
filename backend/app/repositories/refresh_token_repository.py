from typing import Optional
import uuid

from sqlalchemy import select, update

from app.models.refresh_token import RefreshToken
from app.repositories.base import BaseRepository


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, session):
        super().__init__(RefreshToken, session)

    async def get_by_hash(self, token_hash: str) -> Optional[RefreshToken]:
        query = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def revoke_family(self, family_id: uuid.UUID) -> None:
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.family_id == family_id)
            .values(is_valid=False)
        )
        await self.session.execute(stmt)

    async def revoke_all_user_tokens(self, user_id: int) -> None:
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .values(is_valid=False)
        )
        await self.session.execute(stmt)

    async def get_active_families_count(self, user_id: int) -> int:
        query = (
            select(RefreshToken.family_id)
            .where(
                RefreshToken.user_id == user_id,
                RefreshToken.is_valid == True,
            )
            .distinct()
        )
        result = await self.session.execute(query)
        return len(result.fetchall())
