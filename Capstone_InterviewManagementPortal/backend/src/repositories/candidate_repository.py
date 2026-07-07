from bson import ObjectId
from typing import Optional, Dict, Any
from pymongo import DESCENDING

from src.constants.auth_constants import CANDIDATE_COLLECTION
from src.core.database import Database

def get_candidate_collection():
    """Return the jobs collection."""
    return Database.get_database()[CANDIDATE_COLLECTION]

async def create_candidate(candidate_data: dict):
    return await get_candidate_collection().insert_one(candidate_data)

async def get_candidates(page: int = 1, limit: int = 10, search: Optional[str] = None) -> Dict[str, Any]:
    skip = (page - 1) * limit
    query_filter = {}

    if search:
        query_filter["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    total = await get_candidate_collection().count_documents(query_filter)

    # paginated results
    cursor = (get_candidate_collection().find(query_filter).sort("_id", DESCENDING).skip(skip).limit(limit))
    candidates =await cursor.to_list(length = limit)
    return {
        "candidates": candidates,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

async def get_candidate_by_id(candidate_id: str):
    return await get_candidate_collection().find_one({"_id": ObjectId(candidate_id)})

async def get_candidate_by_email(email: str):
    return await get_candidate_collection().find_one({"email": email})

async def get_candidate_by_mobile(mobile: str):
    return await get_candidate_collection().find_one({"mobile": mobile})

async def update_candidate(candidate_id: str, candidate_data: dict):
    return await get_candidate_collection().update_one({"_id": ObjectId(candidate_id)}, {"$set": candidate_data})