"""Authentication Router """

from fastapi import (APIRouter, Depends)
from fastapi.security import (HTTPBasic, HTTPBasicCredentials)
from src.schemas.request.login_request import (LoginRequest)
from src.schemas.request.reset_password_request import (ResetPasswordRequest)
from src.schemas.response.login_response import (LoginResponse)
from src.services.auth_service import (authenticate_user, reset_password)
from src.utils.logger import app_logger

router = APIRouter(prefix="/auth", tags=["Authentication"])

security = HTTPBasic()

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """
    Authenticate user:
    Args:payload (LoginRequest)
    Returns:LoginResponse
    """

    user = authenticate_user(payload.email, payload.password)

    return LoginResponse(
        message="Login successful",
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user["role"],
        status=user["status"]
    )

@router.post("/reset-password")
def reset_password_endpoint(payload: ResetPasswordRequest, credentials: HTTPBasicCredentials = Depends(security)):
    """ Reset user password: 
        Email is extracted from Basic Authentication header.
    """

    reset_password(credentials.username, payload.new_password)

    return {"message":"Password reset successful."}

@router.post("/logout")
def logout(credentials: HTTPBasicCredentials = Depends(security)):
    """
    Logout an authenticated user.
    Since HTTP Basic Authentication is stateless, there is no
    server-side session to invalidate. This endpoint validates
    the provided credentials, records the logout event, and
    instructs the client application to remove stored credentials.

    Args:- credentials: HTTP Basic Authentication credentials.
    Returns:- dict: Logout confirmation message.
    """

    user = authenticate_user(credentials.username,credentials.password)
    app_logger.info(f"User logged out: {user['email']}")

    return {
        "message": "Logout successful",
        "note": "Please remove stored credentials from your application"
    }