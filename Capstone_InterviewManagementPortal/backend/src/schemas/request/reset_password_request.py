"""Reset Password Request: Validate incoming password reset requests."""

from pydantic import BaseModel

class ResetPasswordRequest(BaseModel):
    """Password reset request payload."""

    new_password: str