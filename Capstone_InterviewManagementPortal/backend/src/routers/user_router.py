"""
User Router: Provides REST endpoints for managing system users.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from src.enums.role_types import UserRole
from src.enums.user_status import UserStatus
from src.schemas.request.create_user_request import CreateUserRequest
from src.schemas.request.update_user_request import UpdateUserRequest
from src.schemas.response.success_response import SuccessResponse
from src.schemas.response.user_response import (CreateUserResponse, UserListResponse, UserResponse)
from src.services import user_service
from src.utils.logger import app_logger
from src.utils.security import (get_current_user, require_roles)

router = APIRouter(prefix="/users", tags=["User Management"])

@router.post("", response_model=CreateUserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: CreateUserRequest, current_user=Depends(get_current_user),):
    """
    Create a new system user and Accessible only by administrators.
    """
    require_roles(current_user, [UserRole.ADMIN])
    app_logger.info("Create user endpoint invoked by %s",current_user["email"])
    return user_service.create_new_user(payload)

@router.get("", response_model=UserListResponse)
def get_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user=Depends(get_current_user)):
    """ Retrieve system users with pagination and search."""
    require_roles(current_user, [UserRole.ADMIN])
    app_logger.info("List users endpoint invoked.")
    return user_service.list_users(page, limit, search, active)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, current_user=Depends(get_current_user)):
    """ Retrieve a user by ID."""
    require_roles(current_user, [UserRole.ADMIN])
    app_logger.info("Fetching user: %s", user_id)
    return user_service.get_user_by_id(user_id)

@router.put("/{user_id}", response_model=UserResponse)
def update_existing_user(user_id: str, payload: UpdateUserRequest, current_user=Depends(get_current_user)):
    """Update user details."""
    require_roles(current_user, [UserRole.ADMIN])
    app_logger.info("Updating user: %s", user_id)
    return user_service.update_user(user_id, payload)

@router.patch("/{user_id}/status",response_model=SuccessResponse)
def update_user_account_status(user_id: str, 
                               status: UserStatus = Query(..., description="User status (ACTIVE or INACTIVE)"), 
                               current_user=Depends(get_current_user),):

    require_roles(current_user, [UserRole.ADMIN])
    app_logger.info("Updating status for user %s to %s", user_id,status.value)
    return user_service.change_user_status(user_id, status)
