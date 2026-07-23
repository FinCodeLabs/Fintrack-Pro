from datetime import timedelta
from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.core.config import settings
from app.core.exceptions import UnauthorizedException
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.common import APIResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _extract_request_info(
    request: Request,
) -> dict:
    """Extract device info from the incoming request for token binding."""
    return {
        "ip": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "accept_language": request.headers.get("accept-language"),
    }


def _get_refresh_token_from_cookie(request: Request) -> str | None:
    """Extract the opaque refresh token from HttpOnly cookie."""
    return request.cookies.get("refresh_token")


async def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Set the opaque refresh token as an HttpOnly secure cookie."""
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=int(timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()),
        path="/api/v1/auth",
    )


@router.post("/register", response_model=APIResponse[TokenResponse])
async def register(
    data: RegisterRequest,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
):
    """Register a new user account."""
    service = AuthService(session)
    req_info = _extract_request_info(request)
    result = await service.register(data, req_info=req_info)

    await _set_refresh_cookie(response, result["refresh_token"])

    return APIResponse.ok(
        data=TokenResponse(
            access_token=result["access_token"],
            user=UserResponse.model_validate(result["user"]),
        )
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
):
    """Authenticate and create a new token family."""
    service = AuthService(session)
    req_info = _extract_request_info(request)
    result = await service.login(data, req_info=req_info)

    await _set_refresh_cookie(response, result["refresh_token"])

    return APIResponse.ok(
        data=TokenResponse(
            access_token=result["access_token"],
            user=UserResponse.model_validate(result["user"]),
        )
    )


@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
):
    """
    Refresh access token using the HttpOnly refresh token cookie.
    Includes reuse detection — if a used token is replayed, family revoked.
    """
    raw_token = _get_refresh_token_from_cookie(request)
    if not raw_token:
        raise UnauthorizedException("No refresh token provided")

    service = AuthService(session)
    req_info = _extract_request_info(request)
    result = await service.refresh_token(raw_token, req_info=req_info)

    await _set_refresh_cookie(response, result["refresh_token"])

    return APIResponse.ok(
        data=TokenResponse(
            access_token=result["access_token"],
            user=UserResponse.model_validate(result["user"]),
        )
    )


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
):
    """Logout by invalidating the current refresh token."""
    raw_token = _get_refresh_token_from_cookie(request)
    service = AuthService(session)
    await service.logout(raw_token)

    response.delete_cookie(
        key="refresh_token",
        path="/api/v1/auth",
        secure=True,
        samesite="lax",
    )
    return APIResponse.ok(data={"message": "Logged out successfully"})


@router.post("/change-password", response_model=APIResponse[None])
async def change_password(
    data: ChangePasswordRequest,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    """Change password and invalidate all other sessions."""
    service = AuthService(session)
    await service.change_password(
        user_id=current_user.id,
        current_password=data.current_password,
        new_password=data.new_password,
    )
    return APIResponse.ok(data=None)


@router.post("/forgot-password", response_model=APIResponse[dict])
async def forgot_password(
    data: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_db_session),
):
    """Request a password reset."""
    service = AuthService(session)
    token = await service.forgot_password(data.email)
    return APIResponse.ok(data={"message": "If the email exists, a reset link has been sent"})


@router.post("/reset-password", response_model=APIResponse[None])
async def reset_password(
    data: ResetPasswordRequest,
    session: AsyncSession = Depends(get_db_session),
):
    """Reset password using reset token."""
    service = AuthService(session)
    await service.reset_password(token=data.token, password=data.password)
    return APIResponse.ok(data=None)


@router.get("/me", response_model=APIResponse[UserResponse])
async def get_me(current_user: CurrentUser):
    """Get the current authenticated user."""
    return APIResponse.ok(data=UserResponse.model_validate(current_user))
