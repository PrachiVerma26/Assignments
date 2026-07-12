from datetime import datetime
import pytest
from unittest.mock import AsyncMock
from bson import ObjectId
from pymongo import DESCENDING
from src.repositories import interview_repository as repository

def patch_interview_collection(mocker):
    collection = mocker.Mock()
    mocker.patch("src.repositories.interview_repository.get_interview_collection", return_value=collection)
    return collection

@pytest.mark.asyncio
async def test_create_interview_success(mocker):
    collection = patch_interview_collection(mocker)
    insert_result = mocker.Mock(inserted_id=ObjectId())
    collection.insert_one = AsyncMock(return_value=insert_result)
    data = {"candidate_id": str(ObjectId()), "interviewer_id": str(ObjectId()), "interview_datetime": datetime(2099, 12, 1, 10, 0)}
    result = await repository.create_interview(data)
    assert result.inserted_id == insert_result.inserted_id
    collection.insert_one.assert_called_once_with(data)

@pytest.mark.asyncio
async def test_get_interviews_pagination(mocker):
    collection = patch_interview_collection(mocker)
    interviews = [{"_id": ObjectId()}, {"_id": ObjectId()}]
    collection.count_documents = AsyncMock(return_value=15)
    cursor = mocker.Mock()
    cursor.sort.return_value = cursor
    cursor.skip.return_value = cursor
    cursor.limit.return_value = cursor
    cursor.to_list = AsyncMock(return_value=interviews)
    collection.find.return_value = cursor
    result = await repository.get_interviews(page=2, limit=10)
    assert result["interviews"] == interviews
    assert result["total"] == 15
    assert result["page"] == 2
    assert result["total_pages"] == 2
    cursor.sort.assert_called_once_with("_id", DESCENDING)
    cursor.skip.assert_called_once_with(10)
    cursor.limit.assert_called_once_with(10)

@pytest.mark.asyncio
async def test_get_interviews_empty(mocker):
    collection = patch_interview_collection(mocker)
    collection.count_documents = AsyncMock(return_value=0)
    cursor = mocker.Mock()
    cursor.sort.return_value = cursor
    cursor.skip.return_value = cursor
    cursor.limit.return_value = cursor
    cursor.to_list = AsyncMock(return_value=[])
    collection.find.return_value = cursor
    result = await repository.get_interviews(page=1, limit=10)
    assert result["interviews"] == []
    assert result["total"] == 0
    assert result["total_pages"] == 0

@pytest.mark.asyncio
async def test_get_interview_by_id_success(mocker):
    collection = patch_interview_collection(mocker)
    interview_id = ObjectId()
    expected = {"_id": interview_id, "status": "SCHEDULED"}
    collection.find_one = AsyncMock(return_value=expected)
    result = await repository.get_interview_by_id(str(interview_id))
    assert result == expected
    collection.find_one.assert_called_once_with({"_id": interview_id})

@pytest.mark.asyncio
async def test_get_interview_by_id_not_found(mocker):
    collection = patch_interview_collection(mocker)
    collection.find_one = AsyncMock(return_value=None)
    result = await repository.get_interview_by_id(str(ObjectId()))
    assert result is None

@pytest.mark.asyncio
async def test_update_interview_success(mocker):
    collection = patch_interview_collection(mocker)
    update_result = mocker.Mock(modified_count=1)
    collection.update_one = AsyncMock(return_value=update_result)
    interview_id = ObjectId()
    update_data = {"interview_datetime": datetime(2099, 12, 1, 11, 0)}
    result = await repository.update_interview(str(interview_id), update_data)
    assert result.modified_count == 1
    collection.update_one.assert_called_once_with({"_id": interview_id}, {"$set": update_data})

@pytest.mark.asyncio
async def test_get_interviews_by_interviewer(mocker):
    collection = patch_interview_collection(mocker)
    interviewer_id = str(ObjectId())
    interviews = [{"_id": ObjectId(), "interviewer_id": interviewer_id}]
    cursor = mocker.Mock()
    cursor.to_list = AsyncMock(return_value=interviews)
    collection.find.return_value = cursor
    result = await repository.get_interviews_by_interviewer(interviewer_id)
    assert result == interviews
    collection.find.assert_called_once_with({"interviewer_id": interviewer_id})

@pytest.mark.asyncio
async def test_get_candidate_interview(mocker):
    collection = patch_interview_collection(mocker)
    candidate_id = str(ObjectId())
    interview_datetime = datetime(2099, 12, 1, 10, 0)
    expected = {"_id": ObjectId(), "candidate_id": candidate_id}
    collection.find_one = AsyncMock(return_value=expected)
    result = await repository.get_candidate_interview(candidate_id, interview_datetime)
    assert result == expected
    collection.find_one.assert_called_once_with({"candidate_id": candidate_id, "interview_datetime": interview_datetime})

@pytest.mark.asyncio
async def test_get_interviewer_interview(mocker):
    collection = patch_interview_collection(mocker)
    interviewer_id = str(ObjectId())
    interview_datetime = datetime(2099, 12, 1, 10, 0)
    expected = {"_id": ObjectId(), "interviewer_id": interviewer_id}
    collection.find_one = AsyncMock(return_value=expected)
    result = await repository.get_interviewer_interview(interviewer_id, interview_datetime)
    assert result == expected
    collection.find_one.assert_called_once_with({"interviewer_id": interviewer_id, "interview_datetime": interview_datetime})

@pytest.mark.asyncio
async def test_get_candidate_interview_except(mocker):
    collection = patch_interview_collection(mocker)
    candidate_id = str(ObjectId())
    interview_id = ObjectId()
    interview_datetime = datetime(2099, 12, 1, 10, 0)
    collection.find_one = AsyncMock(return_value=None)
    result = await repository.get_candidate_interview_except(candidate_id, interview_datetime, str(interview_id))
    assert result is None
    collection.find_one.assert_called_once_with({"_id": {"$ne": interview_id}, "candidate_id": candidate_id, "interview_datetime": interview_datetime})

@pytest.mark.asyncio
async def test_get_interviewer_interview_except(mocker):
    collection = patch_interview_collection(mocker)
    interviewer_id = str(ObjectId())
    interview_id = ObjectId()
    interview_datetime = datetime(2099, 12, 1, 10, 0)
    collection.find_one = AsyncMock(return_value=None)
    result = await repository.get_interviewer_interview_except(interviewer_id, interview_datetime, str(interview_id))
    assert result is None
    collection.find_one.assert_called_once_with({"_id": {"$ne": interview_id}, "interviewer_id": interviewer_id, "interview_datetime": interview_datetime})

@pytest.mark.asyncio
async def test_submit_feedback(mocker):
    collection = patch_interview_collection(mocker)
    update_result = mocker.Mock(modified_count=1)
    collection.update_one = AsyncMock(return_value=update_result)
    interview_id = ObjectId()
    feedback_data = {"technical_rating": 4, "communication_rating": 5}
    result = await repository.submit_feedback(str(interview_id), feedback_data)
    assert result.modified_count == 1
    collection.update_one.assert_called_once_with({"_id": interview_id}, {"$set": feedback_data})

@pytest.mark.asyncio
async def test_get_feedback(mocker):
    collection = patch_interview_collection(mocker)
    interview_id = ObjectId()
    expected = {"technical_rating": 4, "communication_rating": 5}
    collection.find_one = AsyncMock(return_value=expected)
    result = await repository.get_feedback(str(interview_id))
    assert result == expected
    collection.find_one.assert_called_once_with({"_id": interview_id}, {"technical_rating": 1, "communication_rating": 1, "comments": 1, "recommendation": 1})

@pytest.mark.asyncio
async def test_count_scheduled_interviews(mocker):
    collection = patch_interview_collection(mocker)
    collection.count_documents = AsyncMock(return_value=5)
    result = await repository.count_scheduled_interviews()
    assert result == 5
    collection.count_documents.assert_called_once_with({"status": "SCHEDULED"})

@pytest.mark.asyncio
async def test_count_all_interviews(mocker):
    collection = patch_interview_collection(mocker)
    collection.count_documents = AsyncMock(return_value=10)
    result = await repository.count_all_interviews()
    assert result == 10
    collection.count_documents.assert_called_once_with({})

@pytest.mark.asyncio
async def test_count_assigned_interviews(mocker):
    collection = patch_interview_collection(mocker)
    collection.count_documents = AsyncMock(return_value=4)
    interviewer_id = str(ObjectId())
    result = await repository.count_assigned_interviews(interviewer_id)
    assert result == 4
    collection.count_documents.assert_called_once_with({"interviewer_id": interviewer_id})

@pytest.mark.asyncio
async def test_count_completed_feedback(mocker):
    collection = patch_interview_collection(mocker)
    collection.count_documents = AsyncMock(return_value=3)
    interviewer_id = str(ObjectId())
    result = await repository.count_completed_feedback(interviewer_id)
    assert result == 3
    collection.count_documents.assert_called_once_with({"interviewer_id": interviewer_id, "technical_rating": {"$ne": None}})

@pytest.mark.asyncio
async def test_count_pending_feedback(mocker):
    collection = patch_interview_collection(mocker)
    collection.count_documents = AsyncMock(return_value=2)
    interviewer_id = str(ObjectId())
    result = await repository.count_pending_feedback(interviewer_id)
    assert result == 2
    collection.count_documents.assert_called_once_with({"interviewer_id": interviewer_id, "technical_rating": None})