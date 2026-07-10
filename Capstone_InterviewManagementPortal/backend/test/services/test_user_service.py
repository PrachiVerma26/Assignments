import pytest
from unittest.mock import AsyncMock
from datetime import datetime, UTC
from bson import ObjectId
from src.enums.role_types import UserRole
from src.enums.user_status import UserStatus
from src.exceptions.auth_exceptions import UserNotFoundException
from src.services.user_service import (create_new_user, get_user_by_id, update_user, change_user_status)
from src.exceptions.user_exceptions import DuplicateEmailException, InvalidEmailDomainException, UserAlreadyInactiveException

class CreateUserRequestMock:
    def __init__(self, name, email, role):
        self.name = name
        self.email = email
        self.role = role

class UpdateUserRequestMock:
    def __init__(self, name=None, email=None, role=None):
        self.name = name
        self.email = email
        self.role = role

@pytest.mark.asyncio
async def test_create_user_success(mocker):
    mocker.patch("src.services.user_service.user_repository.find_user_by_email", new=AsyncMock(return_value=None))
    mocker.patch("src.services.user_service.user_repository.find_active_admin", new=AsyncMock(return_value=None))
    mocker.patch("src.services.user_service.encode_password",return_value="encoded_password")
    insert_result = mocker.Mock()
    insert_result.inserted_id = ObjectId()
    mocker.patch("src.services.user_service.user_repository.create_user", new=AsyncMock(return_value=insert_result))
    request = CreateUserRequestMock("Ram Verma", "ram@nucleusteq.com", UserRole.INTERVIEWER)
    result = await create_new_user(request)
    assert result.message == "User created successfully."
    assert result.user.name == "Ram Verma"
    assert result.user.email == "ram@nucleusteq.com"

@pytest.mark.asyncio
async def test_create_user_duplicate_email(mocker):
    mocker.patch("src.services.user_service.user_repository.find_user_by_email", new=AsyncMock(return_value={"email": "ram@nucleusteq.com"}))
    request = CreateUserRequestMock(
        "Ram Verma",
        "ram@nucleusteq.com",
        UserRole.INTERVIEWER)
    with pytest.raises(DuplicateEmailException):
        await create_new_user(request)

@pytest.mark.asyncio
async def test_create_user_invalid_domain():
    request = CreateUserRequestMock(
        "Ram Verma",
        "ram@gmail.com",
        UserRole.INTERVIEWER)
    with pytest.raises(InvalidEmailDomainException):
        await create_new_user(request)

@pytest.mark.asyncio
async def test_create_admin_when_admin_exists(mocker):
    mocker.patch("src.services.user_service.user_repository.find_user_by_email", new=AsyncMock(return_value=None))
    mocker.patch("src.services.user_service.user_repository.find_active_admin", new=AsyncMock(return_value={"_id": ObjectId(), "role": "ADMIN", "status": "ACTIVE"}))
    request = CreateUserRequestMock(
        "Admin",
        "admin2@nucleusteq.com",
        UserRole.ADMIN)
    with pytest.raises(DuplicateEmailException):
        await create_new_user(request)

@pytest.mark.asyncio
async def test_get_user_by_id_success(mocker):
    user_id = str(ObjectId())
    mock_user = {
        "_id": ObjectId(user_id),
        "name": "Ram Verma",
        "email": "ram@nucleusteq.com",
        "role": UserRole.INTERVIEWER.value,
        "status": UserStatus.ACTIVE.value,
        "created_at": datetime.now(UTC),
    }
    mocker.patch("src.services.user_service.user_repository.find_user_by_id", new=AsyncMock(return_value=mock_user))
    result = await get_user_by_id(user_id)
    assert result.name == "Ram Verma"
    assert result.email == "ram@nucleusteq.com"

@pytest.mark.asyncio
async def test_get_user_by_id_not_found(mocker):
    user_id = str(ObjectId())
    mocker.patch( "src.services.user_service.user_repository.find_user_by_id", new=AsyncMock(return_value=None))
    with pytest.raises(UserNotFoundException):
        await get_user_by_id(user_id)

@pytest.mark.asyncio
async def test_get_user_by_id_invalid_objectid():
    with pytest.raises(UserNotFoundException):
        await get_user_by_id("invalid_id")

@pytest.mark.asyncio
async def test_update_user_name(mocker):
    user_id = str(ObjectId())
    existing = {
        "_id": ObjectId(user_id),
        "name": "Ram Verma",
        "email": "ram@nucleusteq.com",
        "role": UserRole.INTERVIEWER.value,
        "status": UserStatus.ACTIVE.value,
        "created_at": datetime.now(UTC),
    }
    updated = existing.copy()
    updated["name"] = "ram Updated"
    mocker.patch("src.services.user_service.user_repository.find_user_by_id", new=AsyncMock(side_effect=[existing, updated]))
    mocker.patch("src.services.user_service.user_repository.update_user", new=AsyncMock())
    request = UpdateUserRequestMock(name="ram Updated")
    result = await update_user(user_id, request)
    assert result.name == "ram Updated"

@pytest.mark.asyncio
async def test_update_user_email(mocker):
    user_id = str(ObjectId())
    existing = {
        "_id": ObjectId(user_id),
        "name": "Ram Verma",
        "email": "ram@nucleusteq.com",
        "role": UserRole.INTERVIEWER.value,
        "status": UserStatus.ACTIVE.value,
        "created_at": datetime.now(UTC),
    }
    updated = existing.copy()
    updated["email"] = "ram.updated@nucleusteq.com"

    mocker.patch(
        "src.services.user_service.user_repository.find_user_by_id",
        new=AsyncMock(side_effect=[existing, updated]),
    )

    mocker.patch(
        "src.services.user_service.user_repository.find_user_by_email",
        new=AsyncMock(return_value=None),
    )

    mocker.patch(
        "src.services.user_service.user_repository.update_user",
        new=AsyncMock(),
    )

    request = UpdateUserRequestMock(email="ram.updated@nucleusteq.com")

    result = await update_user(user_id, request)

    assert result.email == "ram.updated@nucleusteq.com"

@pytest.mark.asyncio
async def test_update_user_duplicate_email(mocker):
    user_id = str(ObjectId())
    existing = {"_id": ObjectId(user_id), "email": "ram@nucleusteq.com"}
    another = {"_id": ObjectId(), "email": "existing@nucleusteq.com"}
    mocker.patch("src.services.user_service.user_repository.find_user_by_id", new=AsyncMock(return_value=existing))
    mocker.patch("src.services.user_service.user_repository.find_user_by_email", new=AsyncMock(return_value=another))
    request = UpdateUserRequestMock(email="existing@nucleusteq.com")
    with pytest.raises(DuplicateEmailException):
        await update_user(user_id, request)

@pytest.mark.asyncio
async def test_update_user_invalid_domain(mocker):
    user_id = str(ObjectId())
    existing = {"_id": ObjectId(user_id), "email": "ram@nucleusteq.com"}
    mocker.patch("src.services.user_service.user_repository.find_user_by_id", new=AsyncMock(return_value=existing))
    request = UpdateUserRequestMock(email="ram@gmail.com")
    with pytest.raises(InvalidEmailDomainException):
        await update_user(user_id, request)

@pytest.mark.asyncio
async def test_update_user_not_found(mocker):
    user_id = str(ObjectId())
    mocker.patch("src.services.user_service.user_repository.find_user_by_id", new=AsyncMock(return_value=None))
    request = UpdateUserRequestMock(name="Updated")
    with pytest.raises(UserNotFoundException):
        await update_user(user_id, request)

@pytest.mark.asyncio
async def test_update_user_invalid_objectid():
    request = UpdateUserRequestMock(name="Updated")
    with pytest.raises(UserNotFoundException):
        await update_user("invalid_id", request)

@pytest.mark.asyncio
async def test_disable_user_success(mocker):
    user_id = str(ObjectId())
    user = {"_id": ObjectId(user_id), "status": UserStatus.ACTIVE.value}
    mocker.patch("src.services.user_service.user_repository.find_user_by_id", new=AsyncMock(return_value=user))
    mocker.patch("src.services.user_service.user_repository.update_user_status", new=AsyncMock())
    result = await change_user_status(user_id, UserStatus.INACTIVE)
    assert result.message == "User disabled successfully."

@pytest.mark.asyncio
async def test_enable_user_success(mocker):
    user_id = str(ObjectId())
    user = {"_id": ObjectId(user_id), "status": UserStatus.INACTIVE.value}
    mocker.patch("src.services.user_service.user_repository.find_user_by_id", new=AsyncMock(return_value=user))
    mocker.patch("src.services.user_service.user_repository.update_user_status", new=AsyncMock())
    result = await change_user_status(user_id, UserStatus.ACTIVE)
    assert result.message == "User enabled successfully."

@pytest.mark.asyncio
async def test_disable_user_already_inactive(mocker):
    user_id = str(ObjectId())
    user = {"_id": ObjectId(user_id), "status": UserStatus.INACTIVE.value}
    mocker.patch("src.services.user_service.user_repository.find_user_by_id", new=AsyncMock(return_value=user))
    with pytest.raises(UserAlreadyInactiveException):
        await change_user_status(user_id, UserStatus.INACTIVE)

@pytest.mark.asyncio
async def test_change_status_user_not_found(mocker):
    user_id = str(ObjectId())
    mocker.patch("src.services.user_service.user_repository.find_user_by_id", new=AsyncMock(return_value=None))
    with pytest.raises(UserNotFoundException):
        await change_user_status(user_id, UserStatus.INACTIVE)

@pytest.mark.asyncio
async def test_change_status_invalid_objectid():
    with pytest.raises(UserNotFoundException):
        await change_user_status("invalid_id", UserStatus.INACTIVE)