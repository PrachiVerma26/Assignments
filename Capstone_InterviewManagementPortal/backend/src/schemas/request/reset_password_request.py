"""Reset Password Request: Validate incoming password reset requests."""

from pydantic import BaseModel

class ResetPasswordRequest(BaseModel):
    """Password reset request payload."""

    old_password: str
    new_password: str