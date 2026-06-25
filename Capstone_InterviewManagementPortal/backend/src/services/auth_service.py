"""
Authentication Service:
    - User authentication
    - Password verification
    - Password reset
    - Role validation
    - Status validation
"""

from src.constants.auth_constants import ALLOWED_ROLES
from src.enums.user_status import UserStatus
from src.repositories.user_repository import (find_user_by_email, update_password_by_email)
from src.utils.password_utils import (verify_password, encode_password, validate_password)
from src.exceptions.auth_exceptions import (
    UserNotFoundException,
    InvalidCredentialsException,
    InactiveUserException,
    InvalidRoleException
)
from src.utils.logger import app_logger

def validate_role(role):
    """
    Validate user role.
    Args:- role: User role from database
    Raises:- InvalidRoleException
    """

    if role not in ALLOWED_ROLES:
        raise InvalidRoleException("User has an invalid role.")

def authenticate_user(email: str, password: str) -> dict:
    """
    Authenticate user using email and password.
    Args:email (str), password (str)
    Returns:- dict: User document
    Raises:
        UserNotFoundException
        InvalidCredentialsException
        InactiveUserException
        InvalidRoleException
    """

    email = email.strip().lower()
    user = find_user_by_email(email)

    if not user:
        app_logger.warning(f"Login failed. User not found: {email}")
        raise UserNotFoundException("User does not exist.")

    if not verify_password(password, user["password"]):
        app_logger.warning(f"Invalid credentials for: {email}")
        raise InvalidCredentialsException("Invalid email or password.")

    if user["status"] != UserStatus.ACTIVE:
        app_logger.warning(f"Inactive user attempted login: {email}")

        raise InactiveUserException("User account is inactive.")

    validate_role(user["role"])

    app_logger.info(f"User login successful: {email}")

    return user


def reset_password(
    email: str,
    current_password: str,
    new_password: str,
) -> None:
    """
    Reset user password.

    Args:
        email (str): User email.
        current_password (str): Current password from HTTP Basic Authentication.
        new_password (str): New password.

    Raises:
        UserNotFoundException
        InvalidCredentialsException
        PasswordValidationException
    """

    email = email.strip().lower()

    user = find_user_by_email(email)

    if not user:
        app_logger.warning(
            f"Password reset failed. User not found: {email}"
        )

        raise UserNotFoundException(
            "User does not exist."
        )

    # Verify current password
    if not verify_password(current_password, user["password"]):
        app_logger.warning(
            f"Invalid current password for: {email}"
        )

        raise InvalidCredentialsException(
            "Current password is incorrect."
        )

    # Validate new password
    validate_password(new_password)

    # Encode password
    encoded_password = encode_password(new_password)

    # Update password
    update_password_by_email(
        email,
        encoded_password,
    )

    app_logger.info(
        f"Password reset successful for: {email}"
    )