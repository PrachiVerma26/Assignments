from src.constants.auth_constants import ALLOWED_ROLES
from src.enums.user_status import UserStatus
from src.repositories import user_repository
from src.utils.password_utils import verify_password, encode_password, validate_password
from src.exceptions import auth_exceptions
from src.utils.logger import app_logger

def validate_role(role):
    """Validate user role."""
    if role not in ALLOWED_ROLES:
        raise auth_exceptions.InvalidRoleException("User has an invalid role.")

async def authenticate_user(email: str, password: str) -> dict:
    """Authenticate user using email and password."""
    email = email.strip().lower()
    user = await user_repository.find_user_by_email(email)
    if not user:
        app_logger.warning(f"Login failed. User not found: {email}")
        raise auth_exceptions.UserNotFoundException("User does not exist.")
    if not verify_password(password, user["password"]):
        app_logger.warning(f"Invalid credentials for: {email}")
        raise auth_exceptions.InvalidCredentialsException("Invalid email or password.")
    if user["status"] != UserStatus.ACTIVE:
        app_logger.warning(f"Inactive user attempted login: {email}")
        raise auth_exceptions.InactiveUserException("User account is inactive.")
    validate_role(user["role"])
    app_logger.info(f"User login successful: {email}")
    return user

async def reset_password(email: str, current_password: str, new_password: str) -> None:
    """
    Reset user password."""
    email = email.strip().lower()
    user = await user_repository.find_user_by_email(email)
    if not user:
        app_logger.warning(f"Password reset failed. User not found: {email}")
        raise auth_exceptions.UserNotFoundException( "User does not exist.")
    # Verify current password
    if not verify_password(current_password, user["password"]):
        app_logger.warning(f"Invalid current password for: {email}")
        raise auth_exceptions.InvalidCredentialsException("Current password is incorrect.")    
    # Validate new password
    validate_password(new_password)

    encoded_password = encode_password(new_password)
    
    await user_repository.update_password_by_email(email, encoded_password)
    app_logger.info(f"Password reset successful for: {email}")