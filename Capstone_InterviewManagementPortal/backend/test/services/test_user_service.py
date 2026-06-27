"""
User Service Test Cases.
Validate user management business logic without involving FastAPI or MongoDB.
"""

import pytest
from bson import ObjectId
from src.services.user_service import (
    create_new_user,
    get_user_by_id,
    list_users,
    update_user,
    disable_user
)
from src.exceptions.user_exceptions import (
    DuplicateEmailException,
    UserAlreadyInactiveException
)
from src.exceptions.auth_exceptions import UserNotFoundException
from src.enums.user_status import UserStatus
from src.enums.role_types import UserRole

def test_create_user_success(mocker):
    """Verify successful user creation."""
    
    # Mock dependencies
    mocker.patch("src.services.user_service.find_user_by_email", return_value=None)
    mocker.patch("src.services.user_service.validate_password")
    mocker.patch("src.services.user_service.encode_password", return_value="encoded_pass")
    
    mock_result = mocker.Mock()
    mock_result.inserted_id = ObjectId()
    mocker.patch("src.services.user_service.create_user", return_value=mock_result)
    
    # Mock request
    mock_request = mocker.Mock()
    mock_request.name = "John Doe"
    mock_request.email = "john@nucleusteq.com"
    mock_request.password = "Password@123"
    mock_request.role = UserRole.INTERVIEWER
    
    result = create_new_user(mock_request)
    
    assert result.message == "User created successfully."
    assert result.user.name == "John Doe"

def test_create_user_duplicate_email(mocker):
    """Verify duplicate email prevention."""
    
    mocker.patch(
        "src.services.user_service.find_user_by_email",
        return_value={"email": "john@nucleusteq.com"}
    )
    
    mock_request = mocker.Mock()
    mock_request.email = "john@nucleusteq.com"
    
    with pytest.raises(DuplicateEmailException):
        create_new_user(mock_request)

def test_get_user_by_id_success(mocker):
    """Verify successful user retrieval."""
    
    mock_user = {
        "_id": ObjectId(),
        "name": "John Doe",
        "email": "john@nucleusteq.com",
        "role": UserRole.INTERVIEWER,
        "status": UserStatus.ACTIVE,
        "created_at": "2024-01-01"
    }
    
    mocker.patch("src.services.user_service.find_user_by_id", return_value=mock_user)
    
    result = get_user_by_id(str(mock_user["_id"]))
    
    assert result.name == "John Doe"
    assert result.email == "john@nucleusteq.com"

def test_get_user_by_id_not_found(mocker):
    """Verify exception for non-existent user."""
    
    mocker.patch("src.services.user_service.find_user_by_id", return_value=None)
    
    with pytest.raises(UserNotFoundException):
        get_user_by_id("123456789012345678901234")

def test_list_users_success(mocker):
    """Verify successful user listing."""
    
    mock_result = {
        "users": [
            {
                "_id": ObjectId(),
                "name": "John Doe",
                "email": "john@nucleusteq.com", 
                "role": UserRole.INTERVIEWER,
                "status": UserStatus.ACTIVE,
                "created_at": "2024-01-01"
            }
        ],
        "total": 1,
        "page": 1,
        "limit": 10,
        "total_pages": 1
    }
    
    mocker.patch("src.services.user_service.find_users_paginated", return_value=mock_result)
    
    result = list_users(page=1, limit=10)
    
    assert result.total == 1
    assert len(result.users) == 1
    assert result.users[0].name == "John Doe"

def test_update_user_success(mocker):
    """Verify successful user update."""
    
    user_id = str(ObjectId())
    mock_user = {
        "_id": ObjectId(user_id),
        "name": "John Doe",
        "email": "john@nucleusteq.com",
        "role": UserRole.INTERVIEWER, 
        "status": UserStatus.ACTIVE
    }
    
    updated_user = {
        "_id": ObjectId(user_id),
        "name": "John Updated",
        "email": "john.updated@nucleusteq.com",
        "role": UserRole.ADMIN,
        "status": UserStatus.ACTIVE,
        "created_at": "2024-01-01"
    }
    
    mocker.patch("src.services.user_service.find_user_by_id", side_effect=[mock_user, updated_user])
    mocker.patch("src.services.user_service.find_user_by_email", return_value=None)
    mocker.patch("src.services.user_service.update_user")
    
    mock_request = mocker.Mock()
    mock_request.name = "John Updated"
    mock_request.email = "john.updated@nucleusteq.com"
    mock_request.role = UserRole.ADMIN
    
    result = update_user(user_id, mock_request)
    
    assert result.name == "John Updated"

def test_disable_user_success(mocker):
    """Verify successful user disable."""
    
    user_id = str(ObjectId())
    mock_user = {
        "_id": ObjectId(user_id),
        "status": UserStatus.ACTIVE
    }
    
    mocker.patch("src.services.user_service.find_user_by_id", return_value=mock_user)
    mocker.patch("src.services.user_service.update_user_status")
    
    result = disable_user(user_id)
    
    assert result.message == "User disabled successfully."

def test_disable_user_already_inactive(mocker):
    """Verify exception when disabling already inactive user."""
    
    user_id = str(ObjectId()) 
    mock_user = {
        "_id": ObjectId(user_id),
        "status": UserStatus.INACTIVE
    }
    
    mocker.patch("src.services.user_service.find_user_by_id", return_value=mock_user)
    
    with pytest.raises(UserAlreadyInactiveException):
        disable_user(user_id)
