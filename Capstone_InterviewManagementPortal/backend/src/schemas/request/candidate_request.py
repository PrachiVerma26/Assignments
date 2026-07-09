import re
from pydantic import BaseModel, EmailStr, field_validator

def _validate_total_experience(value: str | None) -> str | None:
    if value is None:
        return value
    if not isinstance(value, str):
        raise ValueError("Total experience must be in the format '2 Years', '6 Months', or '2 Years 6 Months'.")
    normalized_value = value.strip()
    if not re.fullmatch(r"(?:(\d+)\s+Years)(?:\s+(\d+)\s+Months)?|(\d+)\s+Months", normalized_value, flags=re.IGNORECASE):
        raise ValueError("Total experience must be in the format '2 Years', '6 Months', or '2 Years 6 Months'.")
    return normalized_value

class CreateCandidateRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile: str
    current_company: str
    total_experience: str
    applied_job_id: str

    @field_validator("total_experience")
    @classmethod
    def validate_total_experience_format(cls, value: str) -> str:
        return _validate_total_experience(value)  # type: ignore[return-value]

class UpdateCandidateRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    mobile: str | None = None
    current_company: str | None = None
    total_experience: str | None = None
    applied_job_id: str | None = None

    @field_validator("total_experience")
    @classmethod
    def validate_total_experience_format(cls, value: str | None) -> str | None:
        return _validate_total_experience(value)