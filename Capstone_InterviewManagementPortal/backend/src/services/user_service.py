"""
User Service: Complete User Management implementation with all CRUD operations.
"""

from datetime import datetime
from typing import Optional
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError

from src.enums.user_status import UserStatus
from src.models.user import User
from src.repositories.user_repository import (
    create_user,
    find_all_users,
    find_user_by_email,
    find_user_by_id,
    find_users_paginated,
    update_user,
    update_user_status,
)
from src.schemas.request.create_user_request import CreateUserRequest
from src.schemas.request.update_user_request import UpdateUserRequest
from src.schemas.response.success_response import SuccessResponse
from src.schemas.response.user_response import (CreateUserResponse, UserListResponse, UserResponse,)
from src.utils.logger import app_logger
from src.utils.password_utils import validate_password, encode_password
from src.exceptions.auth_exceptions import UserNotFoundException
from src.exceptions.user_exceptions import DuplicateEmailException, UserAlreadyInactiveException


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _validate_unique_email(email: str, exclude_user_id: str | None = None) -> None:
    existing = find_user_by_email(email)
    if existing:
        if exclude_user_id and str(existing.get("_id")) == exclude_user_id:
            return
        app_logger.warning("Duplicate email detected: %s", email)
        raise DuplicateEmailException("Email already exists.")


def _build_user_response(user: dict) -> UserResponse:
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


def _get_user_or_raise(user_id: str) -> dict:
    try:
        ObjectId(user_id)
    except InvalidId:
        raise UserNotFoundException("User not found.")

    user = find_user_by_id(user_id)
    if not user:
        raise UserNotFoundException("User not found.")
    return user


def create_new_user(payload: CreateUserRequest) -> CreateUserResponse:
    app_logger.info("Create user request received for: %s", payload.email)

    email = _normalize_email(payload.email)
    _validate_unique_email(email)

    validate_password(payload.password)
    encoded_password = encode_password(payload.password)

    user = User(
        name=payload.name.strip(),
        email=email,
        password=encoded_password,
        role=payload.role,
        status=UserStatus.ACTIVE,
    )

    try:
        result = create_user(user.model_dump())
    except PyMongoError:
        app_logger.exception("Failed to create user: %s", email)
        raise

    created = user.model_dump()
    created["_id"] = result.inserted_id

    app_logger.info("User created successfully: %s", result.inserted_id)

    return CreateUserResponse(
        message="User created successfully.",
        user=_build_user_response(created),
    )


def get_user_by_id(user_id: str) -> UserResponse:
    app_logger.info("Fetching user by ID: %s", user_id)
    
    user = _get_user_or_raise(user_id)
    
    app_logger.info("User found: %s", user["email"])
    return _build_user_response(user)


def list_users(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    active: Optional[bool] = None
    ) -> UserListResponse:

    app_logger.info("Fetching users - page: %d, limit: %d", page, limit)
    result = find_users_paginated(page, limit, search, active)
    users = [_build_user_response(user) for user in result["users"]]
    
    app_logger.info("Fetched %d users (total: %d)", len(users), result["total"])
    
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
    
    # Prepare update data
    update_data = {}
    
    if payload.name:
        update_data["name"] = payload.name.strip()
    
    if payload.email:
        email = _normalize_email(payload.email)
        _validate_unique_email(email, user_id)
        update_data["email"] = email
    
    if payload.role:
        update_data["role"] = payload.role.value
    
    # Always update the timestamp
    update_data["updated_at"] = datetime.utcnow()

    try:
        update_user(user_id, update_data)
    except PyMongoError:
        app_logger.exception("Failed to update user: %s", user_id)
        raise

    # Fetch updated user
    updated_user = find_user_by_id(user_id)
    
    app_logger.info("User updated successfully: %s", user_id)
    return _build_user_response(updated_user)


def disable_user(user_id: str) -> SuccessResponse:
    app_logger.info("Disable user request received for: %s", user_id)

    user = _get_user_or_raise(user_id)
    
    # Check if already inactive
    current_status = user["status"].value if hasattr(user["status"], "value") else user["status"]
    if current_status == UserStatus.INACTIVE.value:
        raise UserAlreadyInactiveException("User is already inactive.")

    try:
        update_user_status(user_id, UserStatus.INACTIVE.value)
    except PyMongoError:
        app_logger.exception("Failed to disable user: %s", user_id)
        raise

    app_logger.info("User disabled successfully: %s", user_id)
    return SuccessResponse(message="User disabled successfully.")
