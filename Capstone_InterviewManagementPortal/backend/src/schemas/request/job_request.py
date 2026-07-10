"""
Job Request Schemas.
"""

from pydantic import BaseModel, Field

class CreateJobRequest(BaseModel):
    """
    Request schema for creating a new job description.
    """

    title: str = Field(..., min_length=1, max_length=200, description="Job title.")
    description: str = Field(..., min_length=1, max_length=5000, description="Detailed job description.")
    requirements: str = Field(..., min_length=1, max_length=2000, description="Job requirements and qualifications.")
    location: str = Field(..., min_length=1, max_length=100, description="Job location.")
    employment_type: str = Field(..., min_length=1, max_length=50, description="Type of employment.")
    salary_range: str = Field(..., min_length=1, max_length=100, description="Salary range for the position.")
    department: str = Field(..., min_length=1, max_length=100, description="Department or team.")
    experience_level: str = Field(..., min_length=1, max_length=50, description="Required experience level.")

class UpdateJobRequest(BaseModel):
    """
    Request schema for updating a job description.
    All fields are optional for partial updates.
    """

    title: str = Field(None, min_length=1, max_length=200, description="Job title.")
    description: str = Field(None, min_length=1, max_length=5000, description="Detailed job description.")
    requirements: str = Field(None, min_length=1, max_length=2000, description="Job requirements and qualifications.")
    location: str = Field(None, min_length=1, max_length=100, description="Job location.")
    employment_type: str = Field(None, min_length=1, max_length=50, description="Type of employment.")
    salary_range: str = Field(None, min_length=1, max_length=100, description="Salary range for the position.")
    department: str = Field(None, min_length=1, max_length=100, description="Department or team.")
    experience_level: str = Field(None, min_length=1, max_length=50, description="Required experience level.")