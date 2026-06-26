"""
User repository.
Contains MongoDB operations related to the users collection.
Responsibilities:
- Perform CRUD operations.
- Execute MongoDB queries.
- Return MongoDB documents/results.

Business validations and exception handling must be performed inside the service layer.
"""
from bson import ObjectId
from typing import Optional, Dict, Any
from pymongo import ASCENDING, DESCENDING
from src.constants.auth_constants import USER_COLLECTION
from src.core.database import db

def find_user_by_email(email: str):
    """
    Retrieve a user by email address.
    Args: email: User email.
    Returns: MongoDB user document or None.
    """
    return db[USER_COLLECTION].find_one({"email": email.lower()})

def create_user(user_data: dict):
    """ 
    Insert a new user document.
    Args: user_data: User document.
    Returns: InsertOneResult
    """
    return db[USER_COLLECTION].insert_one(user_data)

def update_password_by_email(email: str, encoded_password: str):
    """
    Update password using email.
    Args:
        email: User email.
        encoded_password: Base64 encoded password.
    Returns: UpdateResult
    """
    return db[USER_COLLECTION].update_one(
        {"email": email.lower()},
        {"$set": {"password": encoded_password}}
    )


def find_user_by_id(user_id: str):
    """
    Retrieve a user using MongoDB ObjectId.

    Args: user_id: User ObjectId.
    Returns: MongoDB user document or None.
    """
    return db[USER_COLLECTION].find_one({"_id": ObjectId(user_id)})

def find_all_users():
    """
    Retrieve all users.
    Password field is excluded from the result.
    Returns: List of user documents.
    """
    return list(db[USER_COLLECTION].find({},{"password": 0}))

def find_users_paginated(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    active: Optional[bool] = None,
    sort_by: str = "created_at",
    sort_order: int = DESCENDING) -> Dict[str, Any]:
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
    total_count = db[USER_COLLECTION].count_documents(query_filter)

    # Get paginated results
    users = list(
        db[USER_COLLECTION].find(
            query_filter,
            {"password": 0}
        )
        .sort(sort_by, sort_order)
        .skip(skip)
        .limit(limit)
    )

    return {
        "users": users,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit
    }


def update_user(user_id: str, update_data: dict):
    """
    Update user information.
    Args:
        user_id: User ObjectId.
        update_data: Fields to update.
    Returns: UpdateResult
    """
    return db[USER_COLLECTION].update_one({"_id": ObjectId(user_id)},{ "$set": update_data})


def update_user_status(user_id: str, status: str):
    """
    Update user status.
    Used for enabling/disabling users.
    Args:
        user_id: User ObjectId.
        status: ACTIVE / INACTIVE.
    Returns: UpdateResult
    """
    return db[USER_COLLECTION].update_one({"_id": ObjectId(user_id)},{"$set": {"status": status}})
