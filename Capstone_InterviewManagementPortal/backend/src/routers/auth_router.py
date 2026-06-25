"""Authentication Router """

from fastapi import APIRouter
from fastapi.security import HTTPBasic
from src.schemas.request.login_request import LoginRequest
from src.schemas.request.reset_password_request import ResetPasswordRequest
from src.schemas.response.login_response import LoginResponse
from src.services.auth_service import (authenticate_user, reset_password)
from src.utils.logger import app_logger
from src.schemas.response.success_response import SuccessResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

security = HTTPBasic()

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """
    Authenticate user.
    Args:- payload (LoginRequest): User login credentials.
    Returns:- LoginResponse: Authenticated user details.
    """
    app_logger.info(f"Login attempt for email: {payload.email}")
    user = authenticate_user(payload.email, payload.password)

    app_logger.info(f"User '{payload.email}' logged in successfully.")
    return LoginResponse(
        message="Login successful",
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user["role"],
        status=user["status"]
    )

@router.post("/reset-password", response_model=SuccessResponse)
def reset_password(request: ResetPasswordRequest):
    """
    Reset user's password.
    Args:- request (ResetPasswordRequest): Password reset request.
    Returns:- SuccessResponse: Password reset confirmation.
    """
    app_logger.info(f"Password reset requested for email: {request.email}")
    reset_password(request)

    app_logger.info(f"Password reset completed for email: {request.email}")
    return SuccessResponse(message="Password reset successfully.")