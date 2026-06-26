"""
User Response Schemas.
Contains response models used by User Management APIs.
"""

from datetime import datetime
from typing import List
from pydantic import BaseModel

class UserResponse(BaseModel):
    """ Represents a single user returned by the API."""

    id: str
    name: str
    email: str
    role: str
    status: str
    created_at: datetime


class CreateUserResponse(BaseModel):
    """ Response returned after successfully creating a user. """

    message: str
    user: UserResponse


class UserListResponse(BaseModel):
    """Response returned while fetching users with pagination."""

    message: str
    users: List[UserResponse]
    total: int
    page: int
    limit: int
    total_pages: int
