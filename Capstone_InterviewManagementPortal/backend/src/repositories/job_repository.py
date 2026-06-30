"""Job repository. """
from bson import ObjectId
from typing import Optional, Dict, Any
from pymongo import DESCENDING
from src.constants.auth_constants import JOB_COLLECTION
from src.core.database import db

def create_job(job_data: dict):
    """Insert a new job document."""
    return db[JOB_COLLECTION].insert_one(job_data)

def get_jobs(page: int = 1, limit: int = 10, search: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve jobs with pagination and filtering."""
    skip = (page - 1) * limit
    query_filter = {}
    
    if search:
        query_filter["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"department": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]

    # Get total count
    total_count = db[JOB_COLLECTION].count_documents(query_filter)

    # Get paginated results
    jobs = list(db[JOB_COLLECTION].find(query_filter).sort("_id", DESCENDING).skip(skip).limit(limit))

    return {
        "jobs": jobs,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit
    }

def get_job_by_id(job_id: str):
    """Retrieve a job using MongoDB ObjectId."""
    return db[JOB_COLLECTION].find_one({"_id": ObjectId(job_id)})

def update_job(job_id: str, job_data: dict):
    """Update job information."""
    return db[JOB_COLLECTION].update_one({"_id": ObjectId(job_id)}, {"$set": job_data})