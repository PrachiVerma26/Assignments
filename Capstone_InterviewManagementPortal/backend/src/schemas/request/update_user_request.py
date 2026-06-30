"""
Update User Request Schema.
This module contains the request schema used for updating existing system users.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from src.enums.role_types import UserRole

class UpdateUserRequest(BaseModel):
    """
    Request schema for updating user details.
    Only the provided fields will be updated.
    """

    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
        description="Updated user name."
    )

    email: Optional[EmailStr] = Field(
        default=None,
        description="Updated email address."
    )

    role: Optional[UserRole] = Field(
        default=None,
        description="Updated user role."
    )