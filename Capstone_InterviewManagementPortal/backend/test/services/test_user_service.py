import pytest
from datetime import datetime,UTC
from bson import ObjectId
from src.services.user_service import create_new_user,get_user_by_id,list_users,update_user,disable_user
from src.exceptions.auth_exceptions import UserNotFoundException
from src.exceptions.user_exceptions import DuplicateEmailException,UserAlreadyInactiveException
from src.enums.user_status import UserStatus
from src.enums.role_types import UserRole

class CreateUserRequestMock:
    def __init__(self,name,email,role,password="Password@123"):
        self.name=name
        self.email=email
        self.role=role
        self.password=password

class UpdateUserRequestMock:
    def __init__(self,name=None,email=None,role=None):
        self.name=name
        self.email=email
        self.role=role

def test_create_user_success(mocker):
    mocker.patch("src.services.user_service.find_user_by_email",return_value=None)
    mocker.patch("src.services.user_service.validate_password")
    mocker.patch("src.services.user_service.encode_password",return_value="encoded_pass")
    mock_result=mocker.Mock()
    mock_result.inserted_id=ObjectId()
    mocker.patch("src.services.user_service.create_user",return_value=mock_result)
    request=CreateUserRequestMock("John Doe","john@nucleusteq.com",UserRole.INTERVIEWER)
    result=create_new_user(request)
    assert result.message=="User created successfully."
    assert result.user.name=="John Doe"

def test_create_user_duplicate_email(mocker):
    mocker.patch("src.services.user_service.find_user_by_email",return_value={"email":"john@nucleusteq.com"})
    request=CreateUserRequestMock("John Doe","john@nucleusteq.com",UserRole.INTERVIEWER)
    with pytest.raises(DuplicateEmailException):
        create_new_user(request)

def test_list_users_success(mocker):
    mock_data={"users":[{"_id":ObjectId(),"name":"John Doe","email":"john@nucleusteq.com","role":UserRole.INTERVIEWER.value,"status":UserStatus.ACTIVE.value,"created_at":datetime.now(UTC)}],"total":1,"page":1,"limit":10,"total_pages":1}
    mocker.patch("src.services.user_service.find_users_paginated",return_value=mock_data)
    result=list_users()
    assert result.message=="Users retrieved successfully."
    assert len(result.users)==1

def test_list_users_empty(mocker):
    mock_data={"users":[],"total":0,"page":1,"limit":10,"total_pages":0}
    mocker.patch("src.services.user_service.find_users_paginated",return_value=mock_data)
    result=list_users()
    assert result.message=="Users retrieved successfully."
    assert len(result.users)==0

def test_get_user_by_id_success(mocker):
    user_id=str(ObjectId())
    mock_user={"_id":ObjectId(user_id),"name":"John Doe","email":"john@nucleusteq.com","role":UserRole.INTERVIEWER.value,"status":UserStatus.ACTIVE.value,"created_at":datetime.now(UTC)}
    mocker.patch("src.services.user_service.find_user_by_id",return_value=mock_user)
    result=get_user_by_id(user_id)
    assert result.name=="John Doe"

def test_get_user_by_id_invalid_objectid():
    with pytest.raises(UserNotFoundException):
        get_user_by_id("invalid_id")

def test_get_user_by_id_not_found(mocker):
    user_id=str(ObjectId())
    mocker.patch("src.services.user_service.find_user_by_id",return_value=None)
    with pytest.raises(UserNotFoundException):
        get_user_by_id(user_id)

def test_update_user_name(mocker):
    user_id=str(ObjectId())
    mock_user={"_id":ObjectId(user_id),"name":"John Doe","email":"john@nucleusteq.com","role":UserRole.INTERVIEWER.value,"status":UserStatus.ACTIVE.value,"created_at":datetime.now(UTC)}
    updated_user=mock_user.copy()
    updated_user["name"]="John Updated"
    mocker.patch("src.services.user_service.find_user_by_id",side_effect=[mock_user,updated_user])
    mocker.patch("src.services.user_service.update_user")
    request=UpdateUserRequestMock(name="John Updated")
    result=update_user(user_id,request)
    assert result.name=="John Updated"

def test_update_user_email(mocker):
    user_id=str(ObjectId())
    mock_user={"_id":ObjectId(user_id),"name":"John Doe","email":"john@nucleusteq.com","role":UserRole.INTERVIEWER.value,"status":UserStatus.ACTIVE.value,"created_at":datetime.now(UTC)}
    updated_user=mock_user.copy()
    updated_user["email"]="john.updated@nucleusteq.com"
    mocker.patch("src.services.user_service.find_user_by_id",side_effect=[mock_user,updated_user])
    mocker.patch("src.services.user_service.find_user_by_email",return_value=None)
    mocker.patch("src.services.user_service.update_user")
    request=UpdateUserRequestMock(email="john.updated@nucleusteq.com")
    result=update_user(user_id,request)
    assert result.email=="john.updated@nucleusteq.com"

def test_update_user_duplicate_email(mocker):
    user_id=str(ObjectId())
    other_user_id=str(ObjectId())
    mock_user={"_id":ObjectId(user_id),"email":"john@nucleusteq.com"}
    existing_user={"_id":ObjectId(other_user_id),"email":"existing@nucleusteq.com"}
    mocker.patch("src.services.user_service.find_user_by_id",return_value=mock_user)
    mocker.patch("src.services.user_service.find_user_by_email",return_value=existing_user)
    request=UpdateUserRequestMock(email="existing@nucleusteq.com")
    with pytest.raises(DuplicateEmailException):
        update_user(user_id,request)

def test_update_user_not_found(mocker):
    user_id=str(ObjectId())
    mocker.patch("src.services.user_service.find_user_by_id",return_value=None)
    request=UpdateUserRequestMock(name="John Updated")
    with pytest.raises(UserNotFoundException):
        update_user(user_id,request)

def test_update_user_invalid_objectid():
    request=UpdateUserRequestMock(name="John Updated")
    with pytest.raises(UserNotFoundException):
        update_user("invalid_id",request)

def test_disable_user_success(mocker):
    user_id=str(ObjectId())
    mock_user={"_id":ObjectId(user_id),"status":UserStatus.ACTIVE.value}
    mocker.patch("src.services.user_service.find_user_by_id",return_value=mock_user)
    mocker.patch("src.services.user_service.update_user_status")
    result=disable_user(user_id)
    assert result.message=="User disabled successfully."

def test_disable_user_already_inactive(mocker):
    user_id=str(ObjectId())
    mock_user={"_id":ObjectId(user_id),"status":UserStatus.INACTIVE.value}
    mocker.patch("src.services.user_service.find_user_by_id",return_value=mock_user)
    with pytest.raises(UserAlreadyInactiveException):
        disable_user(user_id)

def test_disable_user_not_found(mocker):
    user_id=str(ObjectId())
    mocker.patch("src.services.user_service.find_user_by_id",return_value=None)
    with pytest.raises(UserNotFoundException):
        disable_user(user_id)

def test_disable_user_invalid_objectid():
    with pytest.raises(UserNotFoundException):
        disable_user("invalid_id")