"""Unit tests for user router endpoints."""

import pytest
from datetime import datetime, UTC
from fastapi.testclient import TestClient
from src.main import app
from src.enums.role_types import UserRole
from src.utils.security import get_current_user


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def override_current_user():
    def _override(role=UserRole.ADMIN.value, email="admin@nucleusteq.com"):
        app.dependency_overrides[get_current_user] = lambda: {
            "_id": "admin_id",
            "email": email,
            "role": role,
        }
    return _override


def test_create_user_success(client, mocker, override_current_user):
    override_current_user()
    
    mock_response = {
        "message": "User created successfully.",
        "user": {
            "id": "123",
            "name": "John Doe",
            "email": "john@nucleusteq.com",
            "role": "INTERVIEWER",
            "status": "ACTIVE",
            "created_at": datetime.now(UTC).isoformat()
        }
    }
    mock_create_user = mocker.patch(
        "src.routers.user_router.user_service.create_new_user",
        return_value=mock_response
    )
    
    response = client.post("/users", json={
        "name": "John Doe",
        "email": "john@nucleusteq.com",
        "role": "INTERVIEWER"
    })
    
    assert response.status_code == 201
    assert response.json()["message"] == "User created successfully."
    mock_create_user.assert_called_once()


def test_create_user_unauthorized(client, mocker, override_current_user):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mock_create_user = mocker.patch("src.routers.user_router.user_service.create_new_user")
    
    response = client.post("/users", json={
        "name": "John Doe",
        "email": "john@nucleusteq.com", 
        "role": "INTERVIEWER"
    })
    
    assert response.status_code == 403
    mock_create_user.assert_not_called()


def test_list_users_success(client, mocker, override_current_user):
    override_current_user()
    
    mock_response = {
        "message":"Users retrieved successfully.",
        "users":[{
            "id":"123",
            "name":"John Doe",
            "email":"john@nucleusteq.com",
            "role":"INTERVIEWER",
            "status":"ACTIVE",
            "created_at":datetime.now(UTC).isoformat()
        }],
        "total":1,
        "page":1,
        "limit":10,
        "total_pages":1
    }
    mocker.patch("src.services.user_service.list_users",return_value=mock_response)
    
    client = TestClient(app)
    response = client.get("/users?page=1&limit=10")
    
    # Cleanup
    app.dependency_overrides = {}
    
    assert response.status_code == 200
    assert len(response.json()["users"]) == 1

def test_get_user_by_id_success(mocker):
    def mock_get_current_user():
        return {"_id":"admin_id","role":"ADMIN"}
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    mock_response = {
        "id":"123",
        "name":"John Doe",
        "email":"john@nucleusteq.com",
        "role":"INTERVIEWER",
        "status":"ACTIVE",
        "created_at":datetime.now(UTC).isoformat()
    }
    mocker.patch("src.services.user_service.get_user_by_id",return_value=mock_response)
    
    client = TestClient(app)
    response = client.get("/users/123")
    
    # Cleanup
    app.dependency_overrides = {}
    
    assert response.status_code == 200
    assert response.json()["email"] == "john@nucleusteq.com"

def test_update_user_success(mocker):
    def mock_get_current_user():
        return {"_id":"admin_id","role":"ADMIN"}
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    mock_response = {
        "id":"123",
        "name":"John Updated",
        "email":"john.updated@nucleusteq.com",
        "role":"ADMIN",
        "status":"ACTIVE",
        "created_at":datetime.now(UTC).isoformat()
    }
    mocker.patch("src.services.user_service.update_user",return_value=mock_response)
    
    client = TestClient(app)
    response = client.put("/users/123",json={
        "name":"John Updated",
        "email":"john.updated@nucleusteq.com",
        "role":"ADMIN"
    })
    
    # Cleanup
    app.dependency_overrides = {}
    
    assert response.status_code == 200
    assert response.json()["name"] == "John Updated"

def test_update_user_status_success(mocker):
    def mock_get_current_user():
        return {"_id":"admin_id","role":"ADMIN"}
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    mock_response = {"message":"User disabled successfully."}
    mocker.patch("src.services.user_service.change_user_status",return_value=mock_response)
    
    client = TestClient(app)
    response = client.patch("/users/123/status?status=INACTIVE")
    
    # Cleanup
    app.dependency_overrides = {}
    
    assert response.status_code == 200
    assert response.json()["message"] == "User disabled successfully."