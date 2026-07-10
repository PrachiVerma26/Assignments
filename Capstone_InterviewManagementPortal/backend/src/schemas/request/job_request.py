"""
Job Request Schemas.
"""
from pydantic import BaseModel, Field, ValidationInfo, field_validator
import re

SUPPORTED_EMPLOYMENT_TYPES = ("Full-time", "Part-time", "Contract", "Internship", "Remote")
EXPERIENCE_LEVEL_PATTERN = re.compile(r"^(?:\d+-\d+|\d+\+) Years$")
SALARY_RANGE_PATTERN = re.compile(r"^\d+-\d+ LPA$")
JOB_TEXT_FIELDS = ( "title", "description", "requirements", "location", "employment_type", "salary_range", "department", "experience_level")
REQUIRED_FIELD_MESSAGES = {
    "title": "Job title is required.",
    "description": "Description is required.",
    "requirements": "Requirements are required.",
    "location": "Location is required.",
    "employment_type": "Employment type is required.",
    "salary_range": "Salary range is required.",
    "department": "Department is required.",
    "experience_level": "Experience level is required.",
}

def _trim_and_validate_text(value, field_name: str, allow_none: bool = False):
    """Trim text fields and reject blank values before length validation."""
    if value is None:
        if allow_none:
            return None
        raise ValueError(REQUIRED_FIELD_MESSAGES[field_name])
    if not isinstance(value, str):
        return value
    trimmed_value = value.strip()
    if not trimmed_value:
        raise ValueError(REQUIRED_FIELD_MESSAGES[field_name])
    return trimmed_value

def _validate_employment_type(value: str | None) -> str | None:
    if value is not None and value not in SUPPORTED_EMPLOYMENT_TYPES:
        raise ValueError("Employment type must be one of the supported types.")
    return value

def _validate_experience_level(value: str | None) -> str | None:
    if value is not None and not EXPERIENCE_LEVEL_PATTERN.fullmatch(value):
        raise ValueError("Experience level must be in format like 0-2 Years or 10+ Years.")
    return value

def _validate_salary_range(value: str | None) -> str | None:
    if value is not None and not SALARY_RANGE_PATTERN.fullmatch(value):
        raise ValueError("Salary range must be in format like 8-12 LPA.")
    return value

class CreateJobRequest(BaseModel):
    """ Request schema for creating a new job description."""
    title: str = Field(..., min_length=1, max_length=200, description="Job title.")
    description: str = Field(..., min_length=1, max_length=5000, description="Detailed job description.")
    requirements: str = Field(..., min_length=1, max_length=2000, description="Job requirements and qualifications.")
    location: str = Field(..., min_length=1, max_length=100, description="Job location.")
    employment_type: str = Field(..., min_length=1, max_length=50, description="Type of employment.")
    salary_range: str = Field(..., min_length=1, max_length=100, description="Salary range for the position.")
    department: str = Field(..., min_length=1, max_length=100, description="Department or team.")
    experience_level: str = Field(..., min_length=1, max_length=50, description="Required experience level.")

    @field_validator(*JOB_TEXT_FIELDS, mode="before")
    @classmethod
    def trim_and_validate_required_text(cls, value, info: ValidationInfo):
        return _trim_and_validate_text(value, info.field_name)

    @field_validator("employment_type")
    @classmethod
    def validate_employment_type(cls, value: str) -> str:
        return _validate_employment_type(value)

    @field_validator("experience_level")
    @classmethod
    def validate_experience_level(cls, value: str) -> str:
        return _validate_experience_level(value)

    @field_validator("salary_range")
    @classmethod
    def validate_salary_range(cls, value: str) -> str:
        return _validate_salary_range(value)

class UpdateJobRequest(BaseModel):
    """Request schema for updating a job description. All fields are optional for partial updates. """

    title: str | None = Field(None, min_length=1, max_length=200, description="Job title.")
    description: str | None = Field(None, min_length=1, max_length=5000, description="Detailed job description.")
    requirements: str | None = Field(None, min_length=1, max_length=2000, description="Job requirements and qualifications.")
    location: str | None = Field(None, min_length=1, max_length=100, description="Job location.")
    employment_type: str | None = Field(None, min_length=1, max_length=50, description="Type of employment.")
    salary_range: str | None = Field(None, min_length=1, max_length=100, description="Salary range for the position.")
    department: str | None = Field(None, min_length=1, max_length=100, description="Department or team.")
    experience_level: str | None = Field(None, min_length=1, max_length=50, description="Required experience level.")

    @field_validator(*JOB_TEXT_FIELDS, mode="before")
    @classmethod
    def trim_and_validate_optional_text(cls, value, info: ValidationInfo):
        return _trim_and_validate_text(value, info.field_name, allow_none=True)

    @field_validator("employment_type")
    @classmethod
    def validate_employment_type(cls, value: str | None) -> str | None:
        return _validate_employment_type(value)

    @field_validator("experience_level")
    @classmethod
    def validate_experience_level(cls, value: str | None) -> str | None:
        return _validate_experience_level(value)

    @field_validator("salary_range")
    @classmethod
    def validate_salary_range(cls, value: str | None) -> str | None:
        return _validate_salary_range(value)