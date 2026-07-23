from fastapi import status


class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        code: str = "internal_error",
    ):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(self.message)


class NotFoundException(AppException):
    def __init__(self, entity: str, entity_id: str | int | None = None):
        msg = f"{entity} not found" + (f" (id: {entity_id})" if entity_id else "")
        super().__init__(
            message=msg,
            status_code=status.HTTP_404_NOT_FOUND,
            code="not_found",
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="unauthorized",
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "You don't have permission"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            code="forbidden",
        )


class ConflictException(AppException):
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            code="conflict",
        )


class ValidationException(AppException):
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="validation_error",
        )


class BadRequestException(AppException):
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="bad_request",
        )


class RateLimitException(AppException):
    def __init__(self, message: str = "Too many requests"):
        super().__init__(
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            code="rate_limit",
        )
