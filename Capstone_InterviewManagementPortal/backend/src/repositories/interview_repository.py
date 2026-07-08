from bson import ObjectId
from pymongo import DESCENDING
from src.constants.auth_constants import INTERVIEW_COLLECTION
from src.core.database import Database

def get_interview_collection():
    return Database.get_database()[INTERVIEW_COLLECTION]

async def create_interview(interview_data: dict):
    return await get_interview_collection().insert_one(interview_data)

async def get_interviews(page: int = 1, limit: int = 10):
    skip = (page - 1) * limit
    total = await get_interview_collection().count_documents({})
    cursor = (get_interview_collection().find({}).sort("_id", DESCENDING).skip(skip).limit(limit))
    interviews = await cursor.to_list(length=limit)

    return {"interviews": interviews, "total": total, "page": page, "limit": limit, "total_pages": (total + limit - 1) // limit}

async def get_interview_by_id(interview_id: str):
    return await get_interview_collection().find_one({"_id": ObjectId(interview_id)})

async def update_interview(interview_id: str, update_data: dict):
    return await get_interview_collection().update_one({"_id": ObjectId(interview_id)}, {"$set": update_data})

async def get_interviews_by_interviewer(interviewer_id: str):
    cursor = get_interview_collection().find({"interviewer_id": interviewer_id})
    return await cursor.to_list(length=None)

async def get_candidate_interview(candidate_id: str, interview_date, interview_time):
    return await get_interview_collection().find_one({"candidate_id": candidate_id, "interview_date": interview_date, "interview_time": interview_time,})

async def get_interviewer_interview(interviewer_id: str, interview_date, interview_time):
    return await get_interview_collection().find_one({"interviewer_id": interviewer_id, "interview_date": interview_date, "interview_time": interview_time,})

async def submit_feedback(interview_id: str, feedback_data: dict):
    return await get_interview_collection().update_one({"_id": ObjectId(interview_id)}, {"$set": feedback_data})

async def get_feedback(interview_id: str):
    return await get_interview_collection().find_one({"_id": ObjectId(interview_id)}, {"technical_rating": 1, "communication_rating": 1, "comments": 1, "recommendation": 1,})

async def count_scheduled_interviews() -> int:
    return await get_interview_collection().count_documents({"status": "SCHEDULED"})

async def count_all_interviews() -> int:
    return await get_interview_collection().count_documents({})

async def count_assigned_interviews(interviewer_id: str) -> int:
    return await get_interview_collection().count_documents({"interviewer_id": interviewer_id})

async def count_completed_feedback(interviewer_id: str) -> int:
    return await get_interview_collection().count_documents({"interviewer_id": interviewer_id, "technical_rating": {"$ne": None},})

async def count_pending_feedback(interviewer_id: str) -> int:
    return await get_interview_collection().count_documents({"interviewer_id": interviewer_id, "technical_rating": None,})