"""Unit tests for job service business logic."""

import pytest
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError

from src.services import job_service
from src.exceptions.job_exceptions import JobNotFoundException, DuplicateJobTitleException
from src.enums.role_types import UserRole

class CreateJobRequestMock:
    """Mock for CreateJobRequest."""
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
    """Mock for UpdateJobRequest."""
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

def test_create_new_job_success(mocker):
    """Test successful job creation."""
    # Mock dependencies
    mocker.patch("src.services.job_service.db").__getitem__.return_value.find_one.return_value = None
    mock_result = mocker.Mock()
    mock_result.inserted_id = ObjectId()
    mocker.patch("src.services.job_service.job_repository.create_job", return_value=mock_result)
    mocker.patch("src.services.job_service.app_logger")

    request = CreateJobRequestMock(
        title="Software Engineer",
        description="Develop software applications",
        requirements="Python, FastAPI experience",
        location="Remote",
        employment_type="Full-time",
        salary_range="$80,000 - $120,000",
        department="Engineering",
        experience_level="Mid-level"
    )
    result = job_service.create_new_job(request)
    assert result.message == "Job created successfully."
    assert result.job.title == "Software Engineer"

def test_create_new_job_duplicate_title(mocker):
    """Test job creation with duplicate title."""
    existing_job = {"_id": ObjectId(), "title": "Software Engineer"}
    mocker.patch("src.services.job_service.db").__getitem__.return_value.find_one.return_value = existing_job
    mocker.patch("src.services.job_service.app_logger")

    request = CreateJobRequestMock(
        title="Software Engineer",
        description="Develop software applications",
        requirements="Python, FastAPI experience",
        location="Remote",
        employment_type="Full-time",
        salary_range="$80,000 - $120,000",
        department="Engineering",
        experience_level="Mid-level"
    )

    with pytest.raises(DuplicateJobTitleException, match="Job title already exists."):
        job_service.create_new_job(request)

def test_create_new_job_database_error(mocker):
    """Test job creation with database error."""
    mocker.patch("src.services.job_service.db").__getitem__.return_value.find_one.return_value = None
    mocker.patch("src.services.job_service.job_repository.create_job", side_effect=PyMongoError("Database error"))
    mocker.patch("src.services.job_service.app_logger")
    request = CreateJobRequestMock(
        title="Software Engineer",
        description="Develop software applications",
        requirements="Python, FastAPI experience",
        location="Remote",
        employment_type="Full-time",
        salary_range="$80,000 - $120,000",
        department="Engineering",
        experience_level="Mid-level"
    )
    with pytest.raises(PyMongoError):
        job_service.create_new_job(request)

def test_get_job_by_id_success(mocker):
    """Test successful job retrieval by ID."""
    job_id = str(ObjectId())
    job_doc = {
        "_id": ObjectId(job_id),
        "title": "Software Engineer",
        "description": "Develop software applications",
        "requirements": "Python, FastAPI experience",
        "location": "Remote",
        "employment_type": "Full-time",
        "salary_range": "$80,000 - $120,000",
        "department": "Engineering",
        "experience_level": "Mid-level"
    }
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", return_value=job_doc)
    mocker.patch("src.services.job_service.app_logger")
    result = job_service.get_job_by_id(job_id)
    assert result.message == "Job retrieved successfully."
    assert result.job.id == job_id

def test_get_job_by_id_invalid_id(mocker):
    """Test job retrieval with invalid ObjectId."""
    invalid_job_id = "invalid_id"
    mocker.patch("src.services.job_service.app_logger")    
    with pytest.raises(JobNotFoundException, match="Job not found."):
        job_service.get_job_by_id(invalid_job_id)

def test_get_job_by_id_not_found(mocker):
    """Test job retrieval when job doesn't exist."""
    job_id = str(ObjectId())
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", return_value=None)
    mocker.patch("src.services.job_service.app_logger")
    with pytest.raises(JobNotFoundException, match="Job not found."):
        job_service.get_job_by_id(job_id)

def test_list_jobs_success(mocker):
    """Test successful job listing."""
    mock_jobs_data = {
        "jobs": [
            {
                "_id": ObjectId(),
                "title": "Software Engineer",
                "description": "Develop software",
                "requirements": "Python",
                "location": "Remote",
                "employment_type": "Full-time",
                "salary_range": "$80k-$120k",
                "department": "Engineering",
                "experience_level": "Mid-level"
            }
        ],
        "total": 1,
        "page": 1,
        "limit": 10,
        "total_pages": 1
    }
    mocker.patch("src.services.job_service.job_repository.get_jobs", return_value=mock_jobs_data)
    mocker.patch("src.services.job_service.app_logger")
    result = job_service.list_jobs(page=1, limit=10, search=None)
    assert result.message == "Jobs retrieved successfully."
    assert len(result.jobs) == 1
    assert result.total == 1

def test_list_jobs_with_search(mocker):
    """Test job listing with search parameter."""
    mock_jobs_data = {
        "jobs": [],
        "total": 0,
        "page": 1,
        "limit": 10,
        "total_pages": 0
    }
    mocker.patch("src.services.job_service.job_repository.get_jobs", return_value=mock_jobs_data)
    mocker.patch("src.services.job_service.app_logger")
    search_term = "engineer"
    result = job_service.list_jobs(page=1, limit=10, search=search_term)
    assert result.message == "Jobs retrieved successfully."

def test_update_job_success(mocker):
    """Test successful job update."""
    job_id = str(ObjectId())
    existing_job = {
        "_id": ObjectId(job_id),
        "title": "Software Engineer",
        "description": "Old description",
        "requirements": "Python",
        "location": "Remote",
        "employment_type": "Full-time",
        "salary_range": "$80k-$120k",
        "department": "Engineering",
        "experience_level": "Mid-level"
    }
    
    updated_job = existing_job.copy()
    updated_job["title"] = "Senior Software Engineer"
    updated_job["salary_range"] = "$100k-$140k"
    
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", side_effect=[existing_job, updated_job])
    mocker.patch("src.services.job_service.db").__getitem__.return_value.find_one.return_value = None
    mocker.patch("src.services.job_service.job_repository.update_job")
    mocker.patch("src.services.job_service.app_logger")

    request = UpdateJobRequestMock(
        title="Senior Software Engineer",
        salary_range="$100k-$140k"
    )

    result = job_service.update_job(job_id, request)
    
    assert result.title == "Senior Software Engineer"
    assert result.salary_range == "$100k-$140k"

def test_update_job_duplicate_title(mocker):
    """Test job update with duplicate title."""
    job_id = str(ObjectId())
    existing_job = {"_id": ObjectId(job_id),"title": "Software Engineer"}
    
    # Another job with the title we want to update to
    duplicate_job = { "_id": ObjectId(), "title": "Senior Software Engineer"}
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", return_value=existing_job)
    mocker.patch("src.services.job_service.db").__getitem__.return_value.find_one.return_value = duplicate_job
    mocker.patch("src.services.job_service.app_logger")
    request = UpdateJobRequestMock(title="Senior Software Engineer")
    with pytest.raises(DuplicateJobTitleException, match="Job title already exists."):
        job_service.update_job(job_id, request)

def test_update_job_not_found(mocker):
    """Test job update when job doesn't exist."""
    job_id = str(ObjectId())
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", return_value=None)
    mocker.patch("src.services.job_service.app_logger")
    request = UpdateJobRequestMock(title="Senior Software Engineer")
    with pytest.raises(JobNotFoundException, match="Job not found."):
        job_service.update_job(job_id, request)

def test_update_job_database_error(mocker):
    """Test job update with database error."""
    job_id = str(ObjectId())
    existing_job = {"_id": ObjectId(job_id), "title": "Software Engineer"}
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", return_value=existing_job)
    mocker.patch("src.services.job_service.job_repository.update_job", side_effect=PyMongoError("Database error"))
    mocker.patch("src.services.job_service.app_logger")
    request = UpdateJobRequestMock(title="Senior Software Engineer")
    with pytest.raises(PyMongoError):
        job_service.update_job(job_id, request)

def test_update_job_partial_update(mocker):
    """Test partial job update with only some fields."""
    job_id = str(ObjectId())
    existing_job = {
        "_id": ObjectId(job_id),
        "title": "Software Engineer",
        "description": "Develop software",
        "requirements": "Python",
        "location": "Remote",
        "employment_type": "Full-time",
        "salary_range": "$80k-$120k",
        "department": "Engineering",
        "experience_level": "Mid-level"
    }    
    updated_job = existing_job.copy()
    updated_job["description"] = "Develop advanced software applications"
    mocker.patch("src.services.job_service.job_repository.get_job_by_id", side_effect=[existing_job, updated_job])
    mocker.patch("src.services.job_service.db").__getitem__.return_value.find_one.return_value = None
    mock_update = mocker.patch("src.services.job_service.job_repository.update_job")
    mocker.patch("src.services.job_service.app_logger")
    request = UpdateJobRequestMock(description="Develop advanced software applications")
    result = job_service.update_job(job_id, request)
    mock_update.assert_called_once()
    call_args = mock_update.call_args
    assert call_args[0][0] == job_id  # job_id
    assert call_args[0][1] == {"description": "Develop advanced software applications"}
    assert result.description == "Develop advanced software applications"