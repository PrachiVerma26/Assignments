""" Authentication Service Test Cases
    Validate authentication business logic without involving FastAPI or MongoDB.
"""

import pytest

from src.services.auth_service import (authenticate_user, validate_role, reset_password)
from src.exceptions.auth_exceptions import (UserNotFoundException, InvalidCredentialsException, InactiveUserException, InvalidRoleException)
from src.enums.user_status import UserStatus
from src.enums.role_types import UserRole

def test_authenticate_user_success(mocker):
    """ Test case1: Verify successful authentication for an active admin user."""

    mock_user = {
        "email": "admin@nucleusteq.com",
        "password": "encoded_password",
        "role": UserRole.ADMIN,
        "status": UserStatus.ACTIVE
    }

    mocker.patch("src.services.auth_service.find_user_by_email", return_value=mock_user)
    mocker.patch("src.services.auth_service.verify_password",return_value=True)
    result = authenticate_user("admin@nucleusteq.com","Admin@123")
    assert result == mock_user


def test_authenticate_user_not_found(mocker):
    """ Test Case2: Verify exception is raised when user does not exist. """

    mocker.patch("src.services.auth_service.find_user_by_email", return_value=None)

    with pytest.raises(UserNotFoundException):
        authenticate_user( "invalid@nucleusteq.com","Admin@123") 


def test_authenticate_user_invalid_password(mocker):
    """ Test case 3: Verify exception is raised for incorrect password."""

    mock_user = {
        "email": "admin@nucleusteq.com",
        "password": "encoded_password",
        "role": UserRole.ADMIN,
        "status": UserStatus.ACTIVE
    }

    mocker.patch("src.services.auth_service.find_user_by_email", return_value=mock_user)
    mocker.patch("src.services.auth_service.verify_password", return_value=False)

    with pytest.raises(InvalidCredentialsException):
        authenticate_user("admin@nucleusteq.com", "WrongPassword")  
        
def test_authenticate_user_inactive_user(mocker):
    """Test case 4: Verify inactive users cannot login."""

    mock_user = {
        "email": "admin@nucleusteq.com",
        "password": "encoded_password",
        "role": UserRole.ADMIN,
        "status": UserStatus.INACTIVE
    }

    mocker.patch("src.services.auth_service.find_user_by_email", return_value=mock_user)

    mocker.patch("src.services.auth_service.verify_password", return_value=True)

    with pytest.raises(InactiveUserException):
        authenticate_user("admin@nucleusteq.com", "Admin@123")

def test_validate_role_success():
    """Test case 5: Verify valid roles."""

    validate_role(UserRole.ADMIN)


def test_reset_password_success(mocker):
    """
    Verify password reset updates the user's password successfully.
    """

    mocker.patch(
        "src.services.auth_service.find_user_by_email",
        return_value={"email": "admin@nucleusteq.com"}
    )

    mocker.patch("src.services.auth_service.validate_password")
    mocker.patch("src.services.auth_service.encode_password",return_value="encoded_password")

    mock_update = mocker.patch("src.services.auth_service.update_password_by_email")

    reset_password("admin@nucleusteq.com", "Admin@123")

    mock_update.assert_called_once_with("admin@nucleusteq.com", "encoded_password")