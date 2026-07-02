"""
Authentication Router Tests.
Contains unit tests for authentication API endpoints, including login and password reset operations.
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.exceptions.auth_exceptions import InvalidCredentialsException

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
    assert response.json()["message"] == "Login successful"
    assert response.json()["email"] == "admin@nucleusteq.com"

def test_login_invalid_credentials(mocker):
    """Verify login fails with invalid credentials."""
    
    mocker.patch(
        "src.routers.auth_router.authenticate_user",
        side_effect=InvalidCredentialsException("Invalid credentials")
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "admin@nucleusteq.com",
            "password": "WrongPassword"
        }
    )

    assert response.status_code == 400

def test_reset_password_success(mocker):
    """Verify successful password reset with authorization."""

    # Mock the authenticate_user function used in get_current_user
    mocker.patch(
        "src.routers.auth_router.authenticate_user",
        return_value={
            "_id": "123",
            "email": "admin@nucleusteq.com",
            "name": "Admin"
        }
    )
    
    # Mock the reset_password service
    mocker.patch("src.routers.auth_router.reset_password")

    response = client.post(
        "/auth/reset-password",
        json={"new_password": "NewPassword@123"},
        auth=("admin@nucleusteq.com", "Admin@123")
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Password reset successfully."

def test_reset_password_unauthorized():
    """Verify reset password fails without proper authorization."""

    response = client.post(
        "/auth/reset-password",
        json={"new_password": "NewPassword@123"}
    )

    assert response.status_code == 401
