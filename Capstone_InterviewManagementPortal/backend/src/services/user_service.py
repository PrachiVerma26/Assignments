"""User Service: Contains business rules for user management.
"""

from datetime import datetime
from bson import ObjectId, errors as bson_errors
from src.core.config import settings
from src.enums.user_status import UserStatus
from src.repositories import user_repository
from src.schemas.request.create_user_request import CreateUserRequest
from src.schemas.request.update_user_request import UpdateUserRequest
from src.schemas.response.user_response import CreateUserResponse, UserResponse, UserListResponse
from src.schemas.response.success_response import SuccessResponse
from src.utils.logger import app_logger
from src.utils.password_utils import encode_password, validate_password
from src.exceptions import user_exceptions

def create_new_user(request: CreateUserRequest) -> CreateUserResponse:
    """Create user."""
    app_logger.info("Create user request received for: %s", request.email)
    email = request.email.strip().lower()
    if user_repository.find_user_by_email(email):
        raise user_exceptions.DuplicateEmailException("Email already exists.")
    default_password = settings.DEFAULT_USER_PASSWORD
    validate_password(default_password)
    encoded_password = encode_password(default_password)
    user_data = {
        "name": request.name.strip(),
        "email": email,
        "password": encoded_password,
        "role": request.role.value,
        "status": UserStatus.ACTIVE.value,
        "requires_password_reset": True,
        "created_at": datetime.utcnow(),
    }
    insert_result = user_repository.create_user(user_data)
    user_data["_id"] = insert_result.inserted_id
    app_logger.info("User created successfully: %s", insert_result.inserted_id)

    return CreateUserResponse(
        message="User created successfully.",
        user=UserResponse(
            id=str(user_data["_id"]),
            name=user_data["name"],
            email=user_data["email"],
            role=user_data["role"],
            status=user_data["status"],
            created_at=user_data["created_at"],
        ),
    )


def list_users() -> UserListResponse:
    """List all users."""
    app_logger.info("List users request received")
    users = user_repository.find_all_users()
    user_responses = [
        UserResponse(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            role=user["role"],
            status=user["status"],
            created_at=user["created_at"],
        )
        for user in users
    ]
    app_logger.info("Users listed successfully")
    return UserListResponse(message="Users retrieved successfully.", users=user_responses)


def get_user_by_id(user_id: str) -> UserResponse:
    """Get user by ID."""
    app_logger.info("Get user by ID request received for: %s", user_id)
    try:
        ObjectId(user_id)
    except bson_errors.InvalidId:
        raise user_exceptions.InvalidObjectIdException("Invalid ObjectId format.")
    
    user = user_repository.find_user_by_id(user_id)
    if not user:
        raise user_exceptions.UserNotFoundException("User not found.")
    
    app_logger.info("User retrieved successfully: %s", user_id)
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user["role"],
        status=user["status"],
        created_at=user["created_at"],
    )


def update_user(user_id: str, request: UpdateUserRequest) -> UserResponse:
    """Update user."""
    app_logger.info("Update user request received for: %s", user_id)
    try:
        ObjectId(user_id)
    except bson_errors.InvalidId:
        raise user_exceptions.InvalidObjectIdException("Invalid ObjectId format.")
    
    user = user_repository.find_user_by_id(user_id)
    if not user:
        raise user_exceptions.UserNotFoundException("User not found.")
    
    update_data = {k: v for k, v in request.model_dump().items() if v is not None}
    
    if "email" in update_data:
        email = update_data["email"].strip().lower()
        update_data["email"] = email
        existing_user = user_repository.find_user_by_email(email)
        if existing_user and str(existing_user["_id"]) != user_id:
            raise user_exceptions.DuplicateEmailException("Email already exists.")
    
    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()
    
    if "role" in update_data:
        update_data["role"] = update_data["role"].value
    
    update_data["updated_at"] = datetime.utcnow()
    
    user_repository.update_user(user_id, update_data)
    updated_user = user_repository.find_user_by_id(user_id)
    
    app_logger.info("User updated successfully: %s", user_id)
    return UserResponse(
        id=str(updated_user["_id"]),
        name=updated_user["name"],
        email=updated_user["email"],
        role=updated_user["role"],
        status=updated_user["status"],
        created_at=updated_user["created_at"],
    )

def disable_user(user_id: str) -> SuccessResponse:
    """Disable user."""
    app_logger.info("Disable user request received for: %s", user_id)
    try:
        ObjectId(user_id)
    except bson_errors.InvalidId:
        raise user_exceptions.InvalidObjectIdException("Invalid ObjectId format.")
    user = user_repository.find_user_by_id(user_id)
    if not user:
        raise user_exceptions.UserNotFoundException("User not found.")
    if user["status"] == UserStatus.INACTIVE.value:
        raise user_exceptions.UserAlreadyInactiveException("User is already inactive.")
    
    update_data = { "status": UserStatus.INACTIVE.value, "updated_at": datetime.now()}

    user_repository.update_user(user_id, update_data)
    app_logger.info("User disabled successfully: %s", user_id)
    return SuccessResponse(message="User disabled successfully.")

def enable_user(user_id: str) -> SuccessResponse:
    """Enable user."""
    app_logger.info("Enable user request received for: %s", user_id)
    try:
        ObjectId(user_id)
    except bson_errors.InvalidId:
        raise user_exceptions.InvalidObjectIdException("Invalid ObjectId format.")
    
    user = user_repository.find_user_by_id(user_id)
    if not user:
        raise user_exceptions.UserNotFoundException("User not found.")
    
    if user["status"] == UserStatus.ACTIVE.value:
        raise user_exceptions.UserAlreadyActiveException("User is already active.")
    
    update_data = {
        "status": UserStatus.ACTIVE.value,
        "updated_at": datetime.utcnow(),
    }
    
    user_repository.update_user(user_id, update_data)
    
    app_logger.info("User enabled successfully: %s", user_id)
    return SuccessResponse(message="User enabled successfully.")
