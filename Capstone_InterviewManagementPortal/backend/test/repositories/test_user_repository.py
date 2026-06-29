"""Unit tests for user repository MongoDB operations. """

from bson import ObjectId
from src.constants.auth_constants import USER_COLLECTION
from src.repositories import user_repository as repository

def patch_user_collection(mocker):
    collection = mocker.Mock()
    mocker.patch("src.repositories.user_repository.db", {USER_COLLECTION: collection})
    return collection

def test_create_user_success(mocker):
    collection = patch_user_collection(mocker)
    insert_result = mocker.Mock(inserted_id=ObjectId())
    collection.insert_one.return_value = insert_result
    user_data = {
        "name": "Ram Verma",
        "email": "ram@nucleusteq.com",
        "password": "encoded_pass",
        "role": "INTERVIEWER",
        "status": "ACTIVE",
    }

    result = repository.create_user(user_data)
    assert result.inserted_id == insert_result.inserted_id
    collection.insert_one.assert_called_once_with(user_data)

def test_find_user_by_email_success(mocker):
    collection = patch_user_collection(mocker)
    expected_user = {
        "_id": ObjectId(),
        "email": "ram@nucleusteq.com",
        "name": "Ram Verma",
    }
    collection.find_one.return_value = expected_user
    result = repository.find_user_by_email("RAM@NUCLEUSTEQ.COM")
    assert result == expected_user
    collection.find_one.assert_called_once_with({"email": "ram@nucleusteq.com"})


def test_find_user_by_id_success(mocker):
    collection = patch_user_collection(mocker)
    user_id = ObjectId()
    expected_user = {"_id": user_id, "email": "ram@nucleusteq.com"}
    collection.find_one.return_value = expected_user
    result = repository.find_user_by_id(str(user_id))
    assert result == expected_user
    collection.find_one.assert_called_once_with({"_id": user_id})


def test_find_users_paginated_success(mocker):
    collection = patch_user_collection(mocker)
    users = [
        {"_id": ObjectId(), "name": "Ram", "email": "ram@nucleusteq.com"},
        {"_id": ObjectId(), "name": "Shyam", "email": "shyam@nucleusteq.com"},
    ]
    collection.count_documents.return_value = len(users)
    collection.find.return_value.sort.return_value.skip.return_value.limit.return_value = users
    result = repository.find_users_paginated(page=1, limit=10)
    assert result["users"] == users
    assert result["total"] == 2
    assert result["total_pages"] == 1

def test_update_user_success(mocker):
    collection = patch_user_collection(mocker)
    update_result = mocker.Mock(modified_count=1)
    collection.update_one.return_value = update_result
    user_id = ObjectId()
    update_data = {"name": "Ram Updated"}
    result = repository.update_user(str(user_id), update_data)
    assert result.modified_count == 1
    collection.update_one.assert_called_once_with(
        {"_id": user_id},
        {"$set": update_data},
    )
