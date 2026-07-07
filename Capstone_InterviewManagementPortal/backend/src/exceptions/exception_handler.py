"""Global Exception Handlers"""

from fastapi import (Request,status)
from fastapi.responses import JSONResponse
from src.exceptions.auth_exceptions import (
    UserNotFoundException,
    InvalidCredentialsException,
    InactiveUserException,
    InvalidRoleException,
    PasswordValidationException
)

def register_exception_handlers(app):
    """ Register all application exception handlers."""

    @app.exception_handler(UserNotFoundException)
    async def user_not_found_handler(request: Request, exc: UserNotFoundException):

        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={ "message": str(exc)}
        )

    @app.exception_handler(InvalidCredentialsException)
    async def invalid_credentials_handler(request: Request, exc: InvalidCredentialsException):

        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"message": str(exc)}
        )

    @app.exception_handler(InactiveUserException)
    async def inactive_user_handler(request: Request, exc: InactiveUserException):

        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": str(exc)}
        )

    @app.exception_handler(InvalidRoleException)
    async def invalid_role_handler(request: Request, exc: InvalidRoleException):

        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": str(exc)}
        )

    @app.exception_handler(PasswordValidationException)
    async def password_validation_handler(request: Request, exc: PasswordValidationException):

        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": str(exc)}
        )