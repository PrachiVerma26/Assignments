"""Login Response: Define response returned after successful authentication."""

from pydantic import BaseModel

class LoginResponse(BaseModel):
    """Login success response schema."""

    message: str
    id: str
    name: str
    email: str
    role: str
    status: str
    requires_password_reset: bool