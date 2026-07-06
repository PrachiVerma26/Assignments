from bson import ObjectId
from typing import Optional, Dict, Any
from pymongo import DESCENDING
import gridfs

from src.constants.auth_constants import CANDIDATE_COLLECTION, RESUME_BUCKET
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

def upload_resume(file_data: bytes, filename: str) -> str:
    """Store resume bytes in GridFS and return the file_id as a string."""
    fs = gridfs.GridFS(db, collection=RESUME_BUCKET)
    file_id = fs.put(file_data, filename=filename, content_type="application/pdf")
    return str(file_id)

def delete_resume(file_id: str) -> None:
    """Delete a resume from GridFS by file_id."""
    fs = gridfs.GridFS(db, collection=RESUME_BUCKET)
    fs.delete(ObjectId(file_id))

def get_resume(file_id: str):
    """Retrieve a GridFS file object by file_id. Returns None if not found."""
    fs = gridfs.GridFS(db, collection=RESUME_BUCKET)
    try:
        return fs.get(ObjectId(file_id))
    except gridfs.errors.NoFile:
        return None

def push_status_history(candidate_id: str, history_entry: dict) -> None:
    """Append a status history entry to the candidate document."""
    db[CANDIDATE_COLLECTION].update_one(
        {"_id": ObjectId(candidate_id)},
        {"$push": {"status_history": history_entry}}
    )