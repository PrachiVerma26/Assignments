"""Global Exception Handlers"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from src.exceptions import auth_exceptions
from src.exceptions import user_exceptions

def register_exception_handlers(app):
    """ Register all application exception handlers."""

    @app.exception_handler(auth_exceptions.UserNotFoundException)
    async def user_not_found_handler(request: Request, exc: auth_exceptions.UserNotFoundException):

        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={ "message": str(exc)})

    @app.exception_handler(auth_exceptions.InvalidCredentialsException)
    async def invalid_credentials_handler(request: Request, exc: auth_exceptions.InvalidCredentialsException):

        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"message": str(exc)})

    @app.exception_handler(auth_exceptions.InactiveUserException)
    async def inactive_user_handler(request: Request, exc: auth_exceptions.InactiveUserException):

        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": str(exc)}
        )

    @app.exception_handler(auth_exceptions.InvalidRoleException)
    async def invalid_role_handler(request: Request, exc: auth_exceptions.InvalidRoleException):

        return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content={"message": str(exc)})

    @app.exception_handler(auth_exceptions.PasswordValidationException)
    async def password_validation_handler(request: Request, exc: auth_exceptions.PasswordValidationException):

        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})
    
    @app.exception_handler(user_exceptions.DuplicateEmailException)
    async def duplicate_email_exception_handler(request: Request, exc: user_exceptions.DuplicateEmailException):

        return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"message": str(exc)})

    @app.exception_handler(user_exceptions.UserAlreadyInactiveException)
    async def user_already_inactive_handler(request: Request, exc: user_exceptions.UserAlreadyInactiveException):

        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(user_exceptions.UserAlreadyActiveException)
    async def user_already_active_handler(request: Request, exc:user_exceptions.UserAlreadyActiveException):

        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})
