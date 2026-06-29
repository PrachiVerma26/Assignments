"""
Create User Request Schema.
This module contains the request schema used for creating new system users.
"""

from pydantic import BaseModel, EmailStr, Field
from src.enums.role_types import UserRole

class CreateUserRequest(BaseModel):
    """
    Request schema for creating a new user.
    Attributes:
        name: Full name of the user.
        email: Unique email address.
        role: User role assigned by the administrator.
    """

    name: str = Field(..., min_length=2, max_length=100, description="Full name of the user.")
    email: EmailStr = Field(..., description="Unique email address.")
    role: UserRole = Field(..., description="Role assigned to the user.")