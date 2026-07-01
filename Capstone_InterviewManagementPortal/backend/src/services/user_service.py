"""User Service: Complete User Management implementation with all CRUD operations. """

from datetime import datetime
from typing import Optional
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
from src.enums.user_status import UserStatus
from src.enums.role_types import UserRole
from src.models.user import User
from src.repositories import user_repository
from src.schemas.request.create_user_request import CreateUserRequest
from src.schemas.request.update_user_request import UpdateUserRequest
from src.schemas.response.success_response import SuccessResponse
from src.schemas.response.user_response import CreateUserResponse,UserListResponse,UserResponse
from src.utils.logger import app_logger
from src.utils.password_utils import encode_password
from src.exceptions.auth_exceptions import UserNotFoundException
from src.exceptions.user_exceptions import DuplicateEmailException, UserAlreadyInactiveException, UserAlreadyActiveException
from src.core.config import settings

def _get_user_or_raise(user_id: str) -> dict:
    """Retrieve a user by ID or raise UserNotFoundException."""
    try:
        ObjectId(user_id)
    except InvalidId:
        raise UserNotFoundException("User not found.")
    user = user_repository.find_user_by_id(user_id)
    if not user:
        raise UserNotFoundException("User not found.")
    return user

def _build_user_response(user: dict) -> UserResponse:
    """Convert a user document to a UserResponse."""
    role = user["role"].value if hasattr(user["role"], "value") else user["role"]
    status = user["status"].value if hasattr(user["status"], "value") else user["status"]
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=role,
        status=status,
        created_at=user["created_at"],
    )

def create_new_user(payload: CreateUserRequest) -> CreateUserResponse:
    """Create a new user with generated default password."""
    app_logger.info("Create user request received for: %s", payload.email)
    email = payload.email.strip().lower()
    existing_user = user_repository.find_user_by_email(email)
    if existing_user:
        app_logger.warning("Duplicate email detected: %s", email)
        raise DuplicateEmailException("Email already exists.")
    # Admin business rule: only one admin allowed
    if payload.role == UserRole.ADMIN:
        existing_admin = user_repository.find_active_admin()
        if existing_admin:
            app_logger.warning("Attempted to create admin when admin already exists")
            raise DuplicateEmailException("An Administrator already exists in the system.")

    default_password = settings.DEFAULT_USER_PASSWORD.strip()
    encoded_password = encode_password(default_password)

    user = User(
        name=payload.name.strip(),
        email=email,
        password=encoded_password,
        role=payload.role,
        status=UserStatus.ACTIVE,
    )
    try:
        result = user_repository.create_user(user.model_dump())
    except PyMongoError:
        app_logger.exception("Failed to create user: %s", email)
        raise
    created = user.model_dump()
    created["_id"] = result.inserted_id
    app_logger.info("User created successfully: %s", result.inserted_id)
    return CreateUserResponse(message="User created successfully.", user=_build_user_response(created))

def get_user_by_id(user_id: str) -> UserResponse:
    app_logger.info("Fetching user by ID: %s", user_id)
    user = _get_user_or_raise(user_id)
    app_logger.info("User found: %s", user["email"])
    return _build_user_response(user)

def list_users(page: int = 1, limit: int = 10, search: Optional[str] = None, active: Optional[bool] = None) -> UserListResponse:

    app_logger.info("Fetching users - page: %d, limit: %d", page, limit)
    result = user_repository.find_users_paginated(page, limit, search, active)
    users = [_build_user_response(user) for user in result["users"]]
    return UserListResponse(
        message="Users retrieved successfully.",
        users=users,
        total=result["total"],
        page=result["page"],
        limit=result["limit"],
        total_pages=result["total_pages"],
    )

def update_user(user_id: str, payload: UpdateUserRequest) -> UserResponse:
    app_logger.info("Update user request received for: %s", user_id)
    user = _get_user_or_raise(user_id)
    update_data = {}
    if payload.name:
        update_data["name"] = payload.name.strip()
    if payload.email:
        email = payload.email.strip().lower()
        # Validate email is not already in use by another user
        existing_user = user_repository.find_user_by_email(email)
        if existing_user and str(existing_user.get("_id")) != user_id:
            app_logger.warning("Duplicate email detected: %s", email)
            raise DuplicateEmailException("Email already exists.")
        update_data["email"] = email

    if payload.role:
        # Admin business rule: only one admin allowed
        if payload.role == UserRole.ADMIN:
            existing_admin = user_repository.find_active_admin()
            # Reject if another admin already exists (not the current user)
            if existing_admin and str(existing_admin.get("_id")) != user_id:
                app_logger.warning("Attempted to promote user to admin when admin already exists")
                raise DuplicateEmailException("An Administrator already exists in the system.")
        update_data["role"] = payload.role
    update_data["updated_at"] = datetime.utcnow()
    try:
        user_repository.update_user(user_id, update_data)
    except PyMongoError:
        app_logger.exception("Failed to update user: %s", user_id)
        raise
    updated_user = user_repository.find_user_by_id(user_id)
    return _build_user_response(updated_user)

def change_user_status(user_id: str, status: UserStatus) -> SuccessResponse:
    user = _get_user_or_raise(user_id)
    current_status = (user["status"].value if hasattr(user["status"], "value") else user["status"])
    if status == UserStatus.ACTIVE and current_status == UserStatus.ACTIVE.value:
        raise UserAlreadyActiveException("User is already active.")
    if status == UserStatus.INACTIVE and current_status == UserStatus.INACTIVE.value:
        raise UserAlreadyInactiveException("User is already inactive.")
    try:
        user_repository.update_user_status(user_id, status.value)
    except PyMongoError:
        app_logger.exception("Failed to update user status: %s", user_id)
        raise

    action = "enabled" if status == UserStatus.ACTIVE else "disabled"
    return SuccessResponse(message=f"User {action} successfully.")

