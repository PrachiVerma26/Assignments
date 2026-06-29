"""
User Router: Provides REST endpoints for managing system users.
"""
from fastapi import APIRouter, Depends, status
from src.enums.role_types import UserRole
from src.schemas.request.create_user_request import CreateUserRequest
from src.schemas.request.update_user_request import UpdateUserRequest
from src.schemas.response.success_response import SuccessResponse
from src.schemas.response import user_response
from src.services import user_service

from src.utils.logger import app_logger
from src.utils.security import get_current_user, require_roles

router = APIRouter(prefix="/users", tags=["User Management"])

@router.post("", response_model=user_response.CreateUserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: CreateUserRequest, current_user=Depends(get_current_user),):
    """
    Create a new system user and Accessible only by administrators.
    """

    require_roles(current_user, [UserRole.ADMIN])

    app_logger.info("Create user endpoint invoked by %s",current_user["email"])
    return user_service.create_new_user(payload)


@router.get("", response_model=user_response.UserListResponse)
def get_users(current_user=Depends(get_current_user)):
    """ Retrieve system users."""

    require_roles(current_user, [UserRole.ADMIN])

    app_logger.info("List users endpoint invoked.")
    return user_service.list_users()


@router.get("/{user_id}", response_model=user_response.UserResponse)
def get_user(user_id: str, current_user=Depends(get_current_user)):
    """ Retrieve a user by ID."""

    require_roles(current_user, [UserRole.ADMIN])

    app_logger.info("Fetching user: %s", user_id)
    return user_service.get_user_by_id(user_id)


@router.put("/{user_id}", response_model=user_response.UserResponse)
def update_existing_user(user_id: str, payload: UpdateUserRequest, current_user=Depends(get_current_user)):
    """Update user details."""

    require_roles(current_user, [UserRole.ADMIN])

    app_logger.info("Updating user: %s", user_id)
    return user_service.update_user(user_id, payload)

@router.patch("/{user_id}/disable", response_model=SuccessResponse,)
def disable_user_account(user_id: str, current_user=Depends(get_current_user)):
    """Disable user account (soft delete)."""

    require_roles(current_user, [UserRole.ADMIN])

    app_logger.info("Disabling user: %s", user_id)
    return user_service.disable_user(user_id)

@router.patch("/{user_id}/enable", response_model=SuccessResponse)
def enable_user_account(user_id: str, current_user=Depends(get_current_user)):
    """Enable user account."""
    require_roles(current_user, [UserRole.ADMIN])

    app_logger.info("Enabling user: %s", user_id)
    return user_service.enable_user(user_id)