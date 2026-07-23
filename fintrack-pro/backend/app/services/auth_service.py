import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    ConflictException,
    UnauthorizedException,
    ValidationException,
)
from app.core.security import (
    create_access_token,
    generate_opaque_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest, LoginRequest


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.refresh_token_repo = RefreshTokenRepository(session)

    async def register(self, data: RegisterRequest, req_info: dict | None = None) -> dict:
        """Register a new user."""
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise ConflictException(f"Email '{data.email}' is already registered")

        hashed_pw = hash_password(data.password)
        user = await self.user_repo.create(
            email=data.email,
            password_hash=hashed_pw,
            full_name=data.full_name,
        )
        await self.user_repo.create_user_settings(user.id)

        access_token = create_access_token(subject=str(user.id))
        refresh_token = await self._create_refresh_token_entry(
            user_id=user.id, req_info=req_info,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user,
        }

    async def login(self, data: LoginRequest, req_info: dict | None = None) -> dict:
        """Authenticate and create token family."""
        user = await self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedException("Account is deactivated")

        access_token = create_access_token(subject=str(user.id))
        refresh_token = await self._create_refresh_token_entry(
            user_id=user.id, req_info=req_info,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user,
        }

    async def refresh_token(self, raw_token: str, req_info: dict | None = None) -> dict:
        """
        Refresh access token using opaque refresh token.

        🚨 REUSE DETECTION:
        If a token marked as 'used' is presented, the entire family is revoked.
        """
        token_hash = hash_token(raw_token)
        stored_token = await self.refresh_token_repo.get_by_hash(token_hash)

        if not stored_token:
            raise UnauthorizedException("Invalid refresh token")

        if stored_token.expires_at < datetime.now(timezone.utc):
            raise UnauthorizedException("Refresh token has expired. Please log in again.")

        # ─── REUSE DETECTION ───
        if not stored_token.is_valid:
            # Token was already used → someone is replaying it
            await self.refresh_token_repo.revoke_family(stored_token.family_id)
            await self.session.flush()
            raise UnauthorizedException(
                "Security alert: Your session was terminated because your "
                "account may be compromised. Please log in again."
            )

        # ─── TOKEN IS VALID → ROTATE ───
        stored_token.is_valid = False
        await self.session.flush()

        access_token = create_access_token(subject=str(stored_token.user_id))
        new_refresh_token = await self._create_refresh_token_entry(
            user_id=stored_token.user_id,
            family_id=stored_token.family_id,
            req_info=req_info,
        )

        user = await self.user_repo.get(stored_token.user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User account not found or deactivated")

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "user": user,
        }

    async def logout(self, raw_token: str | None) -> None:
        """Invalidate the current refresh token on logout."""
        if not raw_token:
            return
        token_hash = hash_token(raw_token)
        stored = await self.refresh_token_repo.get_by_hash(token_hash)
        if stored:
            stored.is_valid = False
            await self.session.flush()

    async def force_logout_all(self, user_id: int) -> None:
        """Force logout all sessions for a user (e.g., password change)."""
        await self.refresh_token_repo.revoke_all_user_tokens(user_id)
        await self.session.flush()

    async def change_password(
        self, user_id: int, current_password: str, new_password: str
    ) -> None:
        """Change password and invalidate all existing sessions."""
        user = await self.user_repo.get(user_id)
        if not user:
            raise UnauthorizedException("User not found")

        if not verify_password(current_password, user.password_hash):
            raise ValidationException("Current password is incorrect")

        user.password_hash = hash_password(new_password)
        await self.session.flush()
        await self.force_logout_all(user_id)

    async def forgot_password(self, email: str) -> str:
        """Generate a password reset token."""
        import secrets
        user = await self.user_repo.get_by_email(email)
        if not user:
            return ""

        token = secrets.token_urlsafe(32)
        user.reset_password_token = token
        user.reset_password_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        await self.session.flush()
        return token

    async def reset_password(self, token: str, password: str) -> None:
        """Reset password using reset token."""
        user = await self.user_repo.get_by_reset_token(token)
        if not user:
            raise ValidationException("Invalid or expired reset token")

        if user.reset_password_expires and user.reset_password_expires < datetime.now(timezone.utc):
            raise ValidationException("Reset token has expired")

        user.password_hash = hash_password(password)
        user.reset_password_token = None
        user.reset_password_expires = None
        await self.session.flush()

    async def _create_refresh_token_entry(
        self,
        user_id: int,
        family_id: uuid.UUID | None = None,
        req_info: dict | None = None,
    ) -> str:
        """Create a new refresh token entry in the database."""
        from app.core.security import compute_device_fingerprint

        raw_token = generate_opaque_token()
        token_hash = hash_token(raw_token)
        family = family_id or uuid.uuid4()

        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

        device_fp = None
        if req_info:
            device_fp = compute_device_fingerprint(
                user_agent=req_info.get("user_agent"),
                accept_language=req_info.get("accept_language"),
            )

        await self.refresh_token_repo.create(
            token_hash=token_hash,
            user_id=user_id,
            family_id=family,
            expires_at=expires_at,
            device_fingerprint=device_fp,
            ip_address=req_info.get("ip") if req_info else None,
            user_agent=req_info.get("user_agent") if req_info else None,
        )

        return raw_token
