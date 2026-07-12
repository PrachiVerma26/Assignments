"""Unit tests for job service business logic."""

import pytest
from bson import ObjectId
from pymongo.errors import PyMongoError
from unittest.mock import AsyncMock
from src.services import job_service
from src.exceptions.job_exceptions import JobNotFoundException, DuplicateJobTitleException

class CreateJobRequestMock:
    def __init__(self, title, description, requirements, location,
                 employment_type, salary_range, department, experience_level):
        self.title = title
        self.description = description
        self.requirements = requirements
        self.location = location
        self.employment_type = employment_type
        self.salary_range = salary_range
        self.department = department
        self.experience_level = experience_level

class UpdateJobRequestMock:
    def __init__(self, title=None, description=None, requirements=None,
                 location=None, employment_type=None, salary_range=None,
                 department=None, experience_level=None):
        self.title = title
        self.description = description
        self.requirements = requirements
        self.location = location
        self.employment_type = employment_type
        self.salary_range = salary_range
        self.department = department
        self.experience_level = experience_level

def job_doc(job_id=None):
    return {
        "_id": ObjectId(job_id) if job_id else ObjectId(),
        "title": "Software Engineer",
        "description": "Develop software applications",
        "requirements": "Python, FastAPI experience",
        "location": "Remote",
        "employment_type": "Full-time",
        "salary_range": "$80,000 - $120,000",
        "department": "Engineering",
        "experience_level": "Mid-level",
    }

def create_request(**kwargs):
    data = {
        "title": "Software Engineer",
        "description": "Develop software applications",
        "requirements": "Python, FastAPI experience",
        "location": "Remote",
        "employment_type": "Full-time",
        "salary_range": "$80,000 - $120,000",
        "department": "Engineering",
        "experience_level": "Mid-level",
    }
    data.update(kwargs)
    return CreateJobRequestMock(**data)

@pytest.mark.asyncio
async def test_create_new_job_success(mocker):
    """Test successful job creation."""
    mocker.patch("src.services.job_service.job_repository.get_job_by_title", new=AsyncMock(return_value=None))
    mocker.patch("src.services.job_service.job_repository.create_job", new=AsyncMock(return_value=mocker.Mock(inserted_id=ObjectId())))
    result = await job_service.create_new_job(create_request())
    assert result.message == "Job created successfully."
    assert result.job.title == "Software Engineer"

@pytest.mark.asyncio
async def test_create_new_job_duplicate_title(mocker):
    """Test job creation with duplicate title."""
    mocker.patch(
        "src.services.job_service.job_repository.get_job_by_title",
        new=AsyncMock(return_value=job_doc()),
    )
    with pytest.raises(DuplicateJobTitleException, match="Job title already exists."):
        await job_service.create_new_job(create_request())

@pytest.mark.asyncio
async def test_create_new_job_database_error(mocker):
    """Test job creation with database error."""
    mocker.patch("src.services.job_service.job_repository.get_job_by_title", new=AsyncMock(return_value=None))
    mocker.patch("src.services.job_service.job_repository.create_job", new=AsyncMock(side_effect=PyMongoError("Database error")))
    with pytest.raises(PyMongoError):
        await job_service.create_new_job(create_request())

@pytest.mark.asyncio
async def test_get_job_by_id_invalid_id(mocker):
    """Test job retrieval with invalid ObjectId."""
    with pytest.raises(JobNotFoundException, match="Job not found."):
        await job_service.get_job_by_id("invalid_id")

@pytest.mark.asyncio
async def test_update_job_success(mocker):
    """Test successful job update."""
    job_id = str(ObjectId())
    existing = job_doc(job_id)
    updated = existing.copy()
    updated["title"] = "Senior Software Engineer"
    updated["salary_range"] = "$100k-$140k"
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", new=AsyncMock(side_effect=[existing, updated]))
    mocker.patch("src.services.job_service.job_repository.get_job_by_title", new=AsyncMock(return_value=None),)
    mocker.patch("src.services.job_service.job_repository.update_job", new=AsyncMock())
    result = await job_service.update_job(job_id, UpdateJobRequestMock(title="Senior Software Engineer", salary_range="$100k-$140k"))
    assert result.title == "Senior Software Engineer"
    assert result.salary_range == "$100k-$140k"

@pytest.mark.asyncio
async def test_update_job_duplicate_title(mocker):
    """Test job update with duplicate title."""
    job_id = str(ObjectId())
    existing = job_doc(job_id)
    duplicate = job_doc()
    duplicate["title"] = "Senior Software Engineer"
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", new=AsyncMock(return_value=existing))
    mocker.patch("src.services.job_service.job_repository.get_job_by_title", new=AsyncMock(return_value=duplicate))
    with pytest.raises(DuplicateJobTitleException, match="Job title already exists."):
        await job_service.update_job(job_id, UpdateJobRequestMock(title="Senior Software Engineer"))

@pytest.mark.asyncio
async def test_update_job_not_found(mocker):
    """Test job update when job doesn't exist."""
    job_id = str(ObjectId())
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", new=AsyncMock(return_value=None))
    with pytest.raises(JobNotFoundException, match="Job not found."):
        await job_service.update_job(job_id, UpdateJobRequestMock(title="Senior Software Engineer"))

@pytest.mark.asyncio
async def test_update_job_invalid_objectid():
    """Test job update with invalid ObjectId."""
    with pytest.raises(JobNotFoundException, match="Job not found."):
        await job_service.update_job("invalid_id", UpdateJobRequestMock(title="Senior Software Engineer"))

@pytest.mark.asyncio
async def test_update_job_database_error(mocker):
    """Test job update with database error."""
    job_id = str(ObjectId())
    existing = job_doc(job_id)
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", new=AsyncMock(return_value=existing))
    mocker.patch("src.services.job_service.job_repository.update_job", new=AsyncMock(side_effect=PyMongoError("Database error")))
    with pytest.raises(PyMongoError):
        await job_service.update_job(job_id, UpdateJobRequestMock(description="Updated desc"))
