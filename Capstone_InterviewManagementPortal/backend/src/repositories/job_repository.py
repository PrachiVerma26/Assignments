"""Job repository. """
from bson import ObjectId
from typing import Optional, Dict, Any
from pymongo import DESCENDING
from src.constants.auth_constants import JOB_COLLECTION
from src.core.database import Database

def get_job_collection():
    """Return the jobs collection."""
    return Database.get_database()[JOB_COLLECTION]

async def create_job(job_data: dict):
    """Insert a new job document."""
    return await get_job_collection().insert_one(job_data)

async def get_jobs(page: int = 1, limit: int = 10, search: Optional[str] = None) -> Dict[str, Any]:
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
    total_count = await get_job_collection().count_documents(query_filter)

    # Get paginated results
    cursor= (get_job_collection().find(query_filter).sort("_id", DESCENDING).skip(skip).limit(limit))
    jobs= await cursor.to_list(length = limit)
    return {
        "jobs": jobs,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit
    }

async def get_job_by_id(job_id: str):
    """Retrieve a job using MongoDB ObjectId."""
    return await get_job_collection().find_one({"_id": ObjectId(job_id)})

async def update_job(job_id: str, job_data: dict):
    """Update job information."""
    return get_job_collection().update_one({"_id": ObjectId(job_id)}, {"$set": job_data})

async def get_job_by_title(title: str):
    """Retrieve a job by title."""
    return await get_job_collection().find_one({"title": title})