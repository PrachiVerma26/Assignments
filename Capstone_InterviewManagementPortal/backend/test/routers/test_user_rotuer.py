"""
User Router Tests.
Contains unit tests for user management API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.exceptions.user_exceptions import DuplicateEmailException, UserAlreadyInactiveException
from src.exceptions.auth_exceptions import UserNotFoundException

client = TestClient(app)

def test_create_user_success(mocker):
    """Verify successful user creation by admin."""
    
    # Mock authentication
    mocker.patch(
        "src.utils.security.get_current_user",
        return_value={
            "_id": "admin_id",
            "email": "admin@nucleusteq.com",
            "role": "ADMIN"
        }
    )
    
    # Mock user service
    mocker.patch(
        "src.routers.user_router.create_new_user",
        return_value={
            "message": "User created successfully.",
            "user": {
                "id": "123",
                "name": "John Doe",
                "email": "john@nucleusteq.com",
                "role": "INTERVIEWER",
                "status": "ACTIVE"
            }
        }
    )

    response = client.post(
        "/users",
        json={
            "name": "John Doe",
            "email": "john@nucleusteq.com",
            "password": "Password@123",
            "role": "INTERVIEWER"
        },
        auth=("admin@nucleusteq.com", "Admin@123")
    )

    assert response.status_code == 201
    assert response.json()["message"] == "User created successfully."

def test_create_user_unauthorized(mocker):
    """Verify non-admin cannot create users."""
    
    mocker.patch(
        "src.utils.security.get_current_user",
        return_value={
            "_id": "user_id", 
            "email": "user@nucleusteq.com",
            "role": "INTERVIEWER"
        }
    )

    response = client.post(
        "/users",
        json={
            "name": "John Doe",
            "email": "john@nucleusteq.com", 
            "password": "Password@123",
            "role": "INTERVIEWER"
        },
        auth=("user@nucleusteq.com", "Password@123")
    )

    assert response.status_code == 403

def test_list_users_success(mocker):
    """Verify successful user listing with pagination."""
    
    mocker.patch(
        "src.utils.security.get_current_user",
        return_value={"_id": "admin_id", "role": "ADMIN"}
    )
    
    mocker.patch(
        "src.routers.user_router.list_users",
        return_value={
            "message": "Users retrieved successfully.",
            "users": [
                {
                    "id": "123",
                    "name": "John Doe", 
                    "email": "john@nucleusteq.com",
                    "role": "INTERVIEWER",
                    "status": "ACTIVE"
                }
            ],
            "total": 1,
            "page": 1,
            "limit": 10,
            "total_pages": 1
        }
    )

    response = client.get(
        "/users?page=1&limit=10",
        auth=("admin@nucleusteq.com", "Admin@123")
    )

    assert response.status_code == 200
    assert len(response.json()["users"]) == 1

def test_get_user_by_id_success(mocker):
    """Verify successful user retrieval by ID."""
    
    mocker.patch(
        "src.utils.security.get_current_user",
        return_value={"_id": "admin_id", "role": "ADMIN"}
    )
    
    mocker.patch(
        "src.routers.user_router.get_user_by_id",
        return_value={
            "id": "123",
            "name": "John Doe",
            "email": "john@nucleusteq.com", 
            "role": "INTERVIEWER",
            "status": "ACTIVE"
        }
    )

    response = client.get(
        "/users/123",
        auth=("admin@nucleusteq.com", "Admin@123")
    )

    assert response.status_code == 200
    assert response.json()["email"] == "john@nucleusteq.com"

def test_update_user_success(mocker):
    """Verify successful user update."""
    
    mocker.patch(
        "src.utils.security.get_current_user", 
        return_value={"_id": "admin_id", "role": "ADMIN"}
    )
    
    mocker.patch(
        "src.routers.user_router.update_user",
        return_value={
            "id": "123",
            "name": "John Updated",
            "email": "john.updated@nucleusteq.com",
            "role": "ADMIN", 
            "status": "ACTIVE"
        }
    )

    response = client.put(
        "/users/123",
        json={
            "name": "John Updated",
            "email": "john.updated@nucleusteq.com",
            "role": "ADMIN"
        },
        auth=("admin@nucleusteq.com", "Admin@123")
    )

    assert response.status_code == 200
    assert response.json()["name"] == "John Updated"

def test_disable_user_success(mocker):
    """Verify successful user disable."""
    
    mocker.patch(
        "src.utils.security.get_current_user",
        return_value={"_id": "admin_id", "role": "ADMIN"}
    )
    
    mocker.patch(
        "src.routers.user_router.disable_user",
        return_value={"message": "User disabled successfully."}
    )

    response = client.put(
        "/users/123/disable",
        auth=("admin@nucleusteq.com", "Admin@123")
    )

    assert response.status_code == 200
    assert response.json()["message"] == "User disabled successfully."
