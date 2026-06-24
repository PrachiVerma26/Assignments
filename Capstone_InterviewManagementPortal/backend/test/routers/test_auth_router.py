"""
Authentication Router Test Cases: Verify API request and response behavior for authentication endpoints.
"""

from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_login_success(mocker):
    """Verify successful login API response."""

    mocker.patch(
        "src.routers.auth_router.authenticate_user",
        return_value={
            "_id": "123",
            "name": "Admin",
            "email": "admin@nucleusteq.com",
            "role": "ADMIN",
            "status": "ACTIVE"
        }
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "admin@nucleusteq.com",
            "password": "Admin@123"
        }
    )

    assert response.status_code == 200

def test_login_success(mocker):
    """Verify successful login API response."""

    mocker.patch(
        "src.routers.auth_router.authenticate_user",
        return_value={
            "_id": "123",
            "name": "Admin",
            "email": "admin@nucleusteq.com",
            "role": "ADMIN",
            "status": "ACTIVE"
        }
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "admin@nucleusteq.com",
            "password": "Admin@123"
        }
    )

    assert response.status_code == 200

def test_logout(mocker):
    """Verify logout endpoint response."""
    
    mocker.patch(
        "src.routers.auth_router.authenticate_user",
        return_value={"email": "admin@nucleusteq.com"}
    )
    
    response = client.post("/auth/logout", auth=("admin@nucleusteq.com", "Admin@123"))
    assert response.status_code == 200
