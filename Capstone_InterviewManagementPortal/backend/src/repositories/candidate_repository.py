from bson import ObjectId
from typing import Optional, Dict, Any
from pymongo import DESCENDING

from src.constants.auth_constants import CANDIDATE_COLLECTION
from src.core.database import db

def create_candidate(candidate_data: dict):
    return db[CANDIDATE_COLLECTION].insert_one(candidate_data)

def get_candidates(page: int = 1, limit: int = 10, search: Optional[str] = None) -> Dict[str, Any]:
    skip = (page - 1) * limit
    query_filter = {}

    if search:
        query_filter["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    total = db[CANDIDATE_COLLECTION].count_documents(query_filter)

    candidates = list(
        db[CANDIDATE_COLLECTION]
        .find(query_filter)
        .sort("_id", DESCENDING)
        .skip(skip)
        .limit(limit)
    )

    return {
        "candidates": candidates,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

def get_candidate_by_id(candidate_id: str):
    return db[CANDIDATE_COLLECTION].find_one({"_id": ObjectId(candidate_id)})

def get_candidate_by_email(email: str):
    return db[CANDIDATE_COLLECTION].find_one({"email": email})

def get_candidate_by_mobile(mobile: str):
    return db[CANDIDATE_COLLECTION].find_one({"mobile": mobile})

def update_candidate(candidate_id: str, candidate_data: dict):
    return db[CANDIDATE_COLLECTION].update_one({"_id": ObjectId(candidate_id)}, {"$set": candidate_data})