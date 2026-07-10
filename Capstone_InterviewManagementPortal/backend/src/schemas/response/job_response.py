"""
Job Response Schemas.
"""

from typing import List
from pydantic import BaseModel

class JobResponse(BaseModel):
    """Represents a single job returned by the API."""

    id: str
    title: str
    description: str
    requirements: str
    location: str
    employment_type: str
    salary_range: str
    department: str
    experience_level: str

class CreateJobResponse(BaseModel):
    """Response returned after successfully creating a job."""

    message: str
    job: JobResponse

class JobListResponse(BaseModel):
    """Response returned while fetching jobs with pagination."""

    message: str
    jobs: List[JobResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class JobDetailResponse(BaseModel):
    """Response returned when fetching a single job by ID."""

    message: str
    job: JobResponse