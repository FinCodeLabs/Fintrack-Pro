import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: str | Any,
    expires_delta: Optional[timedelta] = None,
) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "type": "access",
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except JWTError:
        raise


# ──────────────────────────────────────────────
# Opaque Refresh Token Utilities
# ──────────────────────────────────────────────

def generate_opaque_token() -> str:
    """Generate a cryptographically secure random 64-byte token."""
    return secrets.token_urlsafe(64)


def hash_token(token: str) -> str:
    """SHA-256 hash of the opaque token for database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def compute_device_fingerprint(
    user_agent: str | None,
    accept_language: str | None,
    screen_resolution: str | None = None,
    timezone_offset: str | None = None,
) -> str:
    """Compute a device fingerprint from browser signals."""
    raw = "|".join([
        user_agent or "",
        accept_language or "",
        screen_resolution or "",
        timezone_offset or "",
    ])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:32]
