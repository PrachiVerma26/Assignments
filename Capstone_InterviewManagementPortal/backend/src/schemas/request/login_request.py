"""Login Request: Validate incoming login requests."""

from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    """Schema for login request payload."""

    email: EmailStr
    password: str