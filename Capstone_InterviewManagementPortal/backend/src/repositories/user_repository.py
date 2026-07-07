"""
User repository: Contains only MongoDB operations related to user collection.
"""
from typing import Any, Dict, Optional
from bson import ObjectId
from pymongo import DESCENDING
from src.core.database import Database
from src.constants.auth_constants import USER_COLLECTION

def get_user_collection():
    return Database.get_database()[USER_COLLECTION]

async def find_user_by_email(email: str):
    return await get_user_collection().find_one({"email": email.lower()})

async def create_user(user_data: dict):
    return await get_user_collection().insert_one(user_data)

async def update_password_by_email(email: str, encoded_password: str):
    return await get_user_collection().update_one(
        {"email": email.lower()},
        {"$set": {"password": encoded_password}}
    )

async def find_user_by_id(user_id: str):
    return await get_user_collection().find_one({"_id": ObjectId(user_id)})

async def find_all_users():
    cursor = get_user_collection().find({}, {"password": 0})
    return await cursor.to_list(length=None)

async def find_users_paginated(page: int = 1, limit: int = 10, search: Optional[str] = None, active: Optional[bool] = None, sort_by: str = "created_at", sort_order: int = DESCENDING) -> Dict[str, Any]:
    """
    Retrieve users with pagination and filtering.
    Args:
        page: Page number (1-based).
        limit: Number of items per page.
        search: Search term for name or email.
        active: Filter by active status.
        sort_by: Field to sort by.
        sort_order: Sort direction (ASCENDING/DESCENDING).
    Returns: Dictionary containing users list and total count.
    """
    skip = (page - 1) * limit
    # Build query filter
    query_filter = {}
    if search:
        query_filter["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    if active is not None:
        status = "ACTIVE" if active else "INACTIVE"
        query_filter["status"] = status
    # Get total count
    total_count = await get_user_collection().count_documents(query_filter)
    # Get paginated results
    cursor = (get_user_collection().find(query_filter, {"password": 0}).sort(sort_by, sort_order).skip(skip).limit(limit))
    users = await cursor.to_list(length=limit)

    return {"users": users, "total": total_count, "page": page, "limit": limit, "total_pages": (total_count + limit - 1) // limit}

async def update_user(user_id: str, update_data: dict):
    return await get_user_collection().update_one({"_id": ObjectId(user_id)},{ "$set": update_data})

async def update_user_status(user_id: str, status: str):
    return await get_user_collection().update_one({"_id": ObjectId(user_id)},{"$set": {"status": status}})

async def find_active_admin():
    return await get_user_collection().find_one({"role": "ADMIN", "status": "ACTIVE"})

