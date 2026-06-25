from datetime import datetime
from pydantic import (BaseModel, EmailStr, Field)
from src.enums.role_types import (UserRole)
from src.enums.user_status import (UserStatus)

class User(BaseModel):
    """
    Represents a system user.
    Users can belong to different roles such as:
    - ADMIN
    - HR
    - INTERVIEWER

    This model is used to store user information inside the MongoDB users collection.
    """

    name: str
    email: EmailStr
    password: str
    role: UserRole
    status: UserStatus

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )