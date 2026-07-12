"""Unit tests for user repository MongoDB operations. """
import pytest
from unittest.mock import AsyncMock
from bson import ObjectId
from pymongo import DESCENDING
from src.constants.auth_constants import USER_COLLECTION
from src.repositories import user_repository as repository

@pytest.mark.asyncio
def patch_user_collection(mocker):
    collection = mocker.Mock()
    mocker.patch("src.repositories.user_repository.get_user_collection", return_value= collection)
    return collection

@pytest.mark.asyncio
async def test_create_user_success(mocker):
    collection = patch_user_collection(mocker)
    insert_result = mocker.Mock(inserted_id=ObjectId())
    collection.insert_one = AsyncMock(return_value = insert_result)
    user_data = {
        "name": "Ram Verma",
        "email": "ram@nucleusteq.com",
        "password": "encoded_pass",
        "role": "INTERVIEWER",
        "status": "ACTIVE",
    }

    result = await repository.create_user(user_data)
    assert result.inserted_id == insert_result.inserted_id
    collection.insert_one.assert_called_once_with(user_data)

@pytest.mark.asyncio
async def test_find_user_by_email_success(mocker):
    collection = patch_user_collection(mocker)
    expected_user = {
        "_id": ObjectId(),
        "email": "ram@nucleusteq.com",
        "name": "Ram Verma",
    }
    collection.find_one = AsyncMock(return_value = expected_user)
    result = await repository.find_user_by_email("RAM@NUCLEUSTEQ.COM")
    assert result == expected_user
    collection.find_one.assert_called_once_with({"email": "ram@nucleusteq.com"})

@pytest.mark.asyncio
async def test_find_user_by_id_success(mocker):
    collection = patch_user_collection(mocker)
    user_id = ObjectId()
    expected_user = {"_id": user_id, "email": "ram@nucleusteq.com"}
    collection.find_one = AsyncMock(return_value = expected_user)
    result = await repository.find_user_by_id(str(user_id))
    assert result == expected_user
    collection.find_one.assert_called_once_with({"_id": user_id})

@pytest.mark.asyncio
async def test_find_users_paginated_success(mocker):
    collection = patch_user_collection(mocker)
    users = [
        {"_id": ObjectId(), "name": "Ram", "email": "ram@nucleusteq.com"},
        {"_id": ObjectId(), "name": "Shyam", "email": "shyam@nucleusteq.com"},
    ]
    collection.count_documents= AsyncMock(return_value = 2)
    cursor = mocker.Mock()
    cursor.sort.return_value = cursor
    cursor.skip.return_value = cursor
    cursor.limit.return_value = cursor
    cursor.to_list = AsyncMock(return_value = users)
    collection.find.return_value = cursor
    result = await repository.find_users_paginated(page=1, limit=10)
    assert result["users"] == users
    assert result["total"] == 2
    assert result["total_pages"] == 1
    assert result["page"] == 1
    assert result["limit"] == 10

    collection.count_documents.assert_called_once_with({})
    collection.find.assert_called_once_with({}, {"password": 0})
    cursor.sort.assert_called_once_with("created_at", DESCENDING)
    cursor.skip.assert_called_once_with(0)
    cursor.limit.assert_called_once_with(10)
    cursor.to_list.assert_awaited_once_with(length=10)

@pytest.mark.asyncio
async def test_update_user_success(mocker):
    collection = patch_user_collection(mocker)
    update_result = mocker.Mock(modified_count=1)
    collection.update_one = AsyncMock(return_value = update_result)
    user_id = ObjectId()
    update_data = {"name": "Ram Updated"}
    result = await repository.update_user(str(user_id), update_data)
    assert result.modified_count == 1
    collection.update_one.assert_called_once_with(
        {"_id": user_id},
        {"$set": update_data},
    )
