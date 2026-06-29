"""
Security utilities: This module provides reusable authentication and authorization
dependencies for protected API endpoints.
These utilities are shared across all modules that require secured access.
"""

from typing import List
from fastapi import Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from src.enums.role_types import UserRole
from src.exceptions import auth_exceptions

from src.repositories.user_repository import find_user_by_email
from src.utils.password_utils import encode_password

security = HTTPBasic()

def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    """
    Authenticate the current user using HTTP Basic Authentication.
    This dependency validates the supplied credentials,
    verifies that the user exists, checks whether the
    account is active, and returns the authenticated user document.

    Args:- credentials: HTTP Basic credentials supplied by FastAPI.

    Returns:- dict: Authenticated user document.

    Raises: UserNotFoundException(If the user does not exist).
        InvalidCredentialsException: If the password is incorrect.
        InactiveUserException: If the user account is inactive.
    """

    email = credentials.username.strip().lower()

    user = find_user_by_email(email)

    if not user:
        raise auth_exceptions.UserNotFoundException("User does not exist.")

    encoded_password = encode_password(credentials.password)

    if user["password"] != encoded_password:
        raise auth_exceptions.InvalidCredentialsException("Invalid email or password.")

    if user["status"] != "ACTIVE":
        raise auth_exceptions.InactiveUserException("User account is inactive.")

    return user


def require_roles(current_user: dict,  allowed_roles: List[UserRole]):
    """
    Authorize the authenticated user.
    Verifies whether the authenticated user has
    one of the permitted roles required to access the requested resource.
    """

    if current_user["role"] not in [role.value for role in allowed_roles]:
        raise auth_exceptions.InvalidRoleException( "You are not authorized to perform this operation.")