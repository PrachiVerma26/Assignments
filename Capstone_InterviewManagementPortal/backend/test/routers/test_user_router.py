"""Unit tests for user router endpoints."""

from datetime import datetime, UTC
from unittest.mock import AsyncMock
from fastapi.testclient import TestClient
from src.main import app
from src.enums.role_types import UserRole
from src.utils.security import get_current_user
import pytest

client = TestClient(app)

@pytest.fixture(autouse=True)
def set_admin_override():
    app.dependency_overrides[get_current_user] = lambda: {"_id": "admin_id", "email": "admin@nucleusteq.com", "role": "ADMIN"}
    yield
    app.dependency_overrides.clear()

def test_create_user_success(mocker):
    mock_create_user = mocker.patch(
        "src.routers.user_router.user_service.create_new_user",
        new=AsyncMock(
            return_value={
                "message": "User created successfully.",
                "user": {
                    "id": "123",
                    "name": "Ram Verma",
                    "email": "ram@nucleusteq.com",
                    "role": "INTERVIEWER",
                    "status": "ACTIVE",
                    "created_at": datetime.now(UTC),
                },
            }
        ),
    )
    response = client.post( "/users",
        json={
            "name": "Ram Verma",
            "email": "ram@nucleusteq.com",
            "password": "Password@123",
            "role": "INTERVIEWER",
        },
    )
    assert response.status_code == 201
    assert response.json()["message"] == "User created successfully."
    mock_create_user.assert_awaited_once()

def test_create_user_unauthorized(mocker):
    app.dependency_overrides[get_current_user] = lambda: {"_id": "user_id", "email": "user@nucleusteq.com", "role": "INTERVIEWER"}
    response = client.post("/users",
        json={"name": "Ram Verma", "email": "ram@nucleusteq.com", "role": "INTERVIEWER"})
    assert response.status_code == 403

def test_list_users_success(mocker):
    mocker.patch("src.routers.user_router.user_service.list_users", new=AsyncMock(
            return_value={
                "message": "Users retrieved successfully.",
                "users": [
                    {
                        "id": "123",
                        "name": "Ram Verma",
                        "email": "ram@nucleusteq.com",
                        "role": "INTERVIEWER",
                        "status": "ACTIVE",
                        "created_at": datetime.now(UTC),
                    }
                ],
                "page": 1,
                "limit": 10,
                "total": 1,
                "total_pages": 1,
            }
        ),
    )
    response = client.get("/users/?page=1&limit=10")
    assert response.status_code == 200
    assert len(response.json()["users"]) == 1

def test_get_user_by_id_success(mocker):
    mocker.patch("src.routers.user_router.user_service.get_user_by_id",
        new=AsyncMock(
            return_value={
                "id": "123",
                "name": "Ram Verma",
                "email": "ram@nucleusteq.com",
                "role": "INTERVIEWER",
                "status": "ACTIVE",
                "created_at": datetime.now(UTC),
            }
        ),
    )
    response = client.get("/users/123")
    assert response.status_code == 200
    assert response.json()["email"] == "ram@nucleusteq.com"

def test_update_user_success(mocker):
    mocker.patch("src.routers.user_router.user_service.update_user",
        new=AsyncMock(
            return_value={
                "id": "123",
                "name": "ram Updated",
                "email": "ram.updated@nucleusteq.com",
                "role": "ADMIN",
                "status": "ACTIVE",
                "created_at": datetime.now(UTC),
            }
        ),
    )
    response = client.put(
        "/users/123",
        json={"name": "ram Updated", "email": "ram.updated@nucleusteq.com", "role": "ADMIN"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "ram Updated"

def test_change_user_status_success(mocker):
    mocker.patch("src.routers.user_router.user_service.change_user_status",
        new=AsyncMock(return_value={"message": "User status updated successfully."}))
    response = client.patch("/users/123/status?status=INACTIVE")
    assert response.status_code == 200
    assert response.json()["message"] == "User status updated successfully."