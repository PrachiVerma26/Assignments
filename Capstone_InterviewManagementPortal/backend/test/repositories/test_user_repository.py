"""
User Repository Test Cases.
Test database operations with mocked MongoDB.
"""

import pytest
from bson import ObjectId
from src.repositories.user_repository import (
    create_user,
    find_user_by_id,
    find_user_by_email,
    find_users_paginated,
    update_user,
    update_user_status
)

def test_create_user_success(mocker):
    """Test successful user creation in database."""
    
    mock_collection = mocker.patch("src.repositories.user_repository.user_collection")
    mock_result = mocker.Mock()
    mock_result.inserted_id = ObjectId()
    mock_collection.insert_one.return_value = mock_result
    
    user_data = {
        "name": "John Doe",
        "email": "john@nucleusteq.com",
        "password": "encoded_pass",
        "role": "INTERVIEWER",
        "status": "ACTIVE"
    }
    
    result = create_user(user_data)
    
    assert result.inserted_id is not None
    mock_collection.insert_one.assert_called_once_with(user_data)

def test_find_user_by_email_success(mocker):
    """Test finding user by email."""
    
    mock_collection = mocker.patch("src.repositories.user_repository.user_collection")
    mock_user = {
        "_id": ObjectId(),
        "email": "john@nucleusteq.com",
        "name": "John Doe"
    }
    mock_collection.find_one.return_value = mock_user
    
    result = find_user_by_email("john@nucleusteq.com")
    
    assert result == mock_user
    mock_collection.find_one.assert_called_once_with({"email": "john@nucleusteq.com"})

def test_find_users_paginated_success(mocker):
    """Test paginated user listing."""
    
    mock_collection = mocker.patch("src.repositories.user_repository.user_collection")
    
    mock_users = [
        {"_id": ObjectId(), "name": "John", "email": "john@nucleusteq.com"},
        {"_id": ObjectId(), "name": "Jane", "email": "jane@nucleusteq.com"}
    ]
    
    mock_collection.count_documents.return_value = 2
    mock_collection.find.return_value.skip.return_value.limit.return_value = mock_users
    
    result = find_users_paginated(page=1, limit=10)
    
    assert result["total"] == 2
    assert len(result["users"]) == 2
    assert result["page"] == 1
    assert result["total_pages"] == 1
