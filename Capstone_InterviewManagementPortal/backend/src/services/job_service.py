"""Job Service: Complete Job Management implementation with all CRUD operations."""

from typing import Optional
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
from src.repositories import job_repository
from src.constants.auth_constants import JOB_COLLECTION
from src.core.database import db
from src.schemas.request.job_request import CreateJobRequest, UpdateJobRequest
from src.schemas.response.job_response import CreateJobResponse, JobListResponse, JobResponse, JobDetailResponse
from src.utils.logger import app_logger
from src.exceptions.job_exceptions import JobNotFoundException, DuplicateJobTitleException

def _get_job_or_raise(job_id: str) -> dict:
    """Retrieve a job by ID or raise JobNotFoundException."""
    try:
        ObjectId(job_id)
    except InvalidId:
        raise JobNotFoundException("Job not found.")
    job = job_repository.get_job_by_id(job_id)
    if not job:
        raise JobNotFoundException("Job not found.")
    return job

def _build_job_response(job: dict) -> JobResponse:
    """Convert a job document to a JobResponse."""
    return JobResponse(
        id=str(job["_id"]),
        title=job["title"],
        description=job["description"],
        requirements=job["requirements"],
        location=job["location"],
        employment_type=job["employment_type"],
        salary_range=job["salary_range"],
        department=job["department"],
        experience_level=job["experience_level"],
    )

def create_new_job(payload: CreateJobRequest) -> CreateJobResponse:
    """Create a new job description."""
    app_logger.info("Create job request received for: %s", payload.title)
    
    title = payload.title.strip()
    existing_job = db[JOB_COLLECTION].find_one({"title": title})
    if existing_job:
        app_logger.warning("Duplicate job title detected: %s", title)
        raise DuplicateJobTitleException("Job title already exists.")

    job_data = {
        "title": title,
        "description": payload.description.strip(),
        "requirements": payload.requirements.strip(),
        "location": payload.location.strip(),
        "employment_type": payload.employment_type.strip(),
        "salary_range": payload.salary_range.strip(),
        "department": payload.department.strip(),
        "experience_level": payload.experience_level.strip(),
    }

    try:
        result = job_repository.create_job(job_data)
    except PyMongoError:
        app_logger.exception("Failed to create job: %s", title)
        raise

    created = job_data.copy()
    created["_id"] = result.inserted_id
    app_logger.info("Job created successfully: %s", result.inserted_id)
    return CreateJobResponse(message="Job created successfully.", job=_build_job_response(created))

def get_job_by_id(job_id: str) -> JobDetailResponse:
    """Get job by ID."""
    app_logger.info("Fetching job by ID: %s", job_id)
    job = _get_job_or_raise(job_id)
    app_logger.info("Job found: %s", job["title"])
    return JobDetailResponse(message="Job retrieved successfully.", job=_build_job_response(job))

def list_jobs(page: int = 1, limit: int = 10, search: Optional[str] = None) -> JobListResponse:
    """List jobs with pagination and optional search."""
    app_logger.info("Fetching jobs - page: %d, limit: %d", page, limit)
    result = job_repository.get_jobs(page, limit, search)
    jobs = [_build_job_response(job) for job in result["jobs"]]
    return JobListResponse(
        message="Jobs retrieved successfully.",
        jobs=jobs,
        total=result["total"],
        page=result["page"],
        limit=result["limit"],
        total_pages=result["total_pages"],
    )

def update_job(job_id: str, payload: UpdateJobRequest) -> JobResponse:
    """Update job description."""
    app_logger.info("Update job request received for: %s", job_id)
    job = _get_job_or_raise(job_id)
    
    update_data = {}
    
    if payload.title:
        title = payload.title.strip()
        # Validate title is not already in use by another job
        existing_job = db[JOB_COLLECTION].find_one({"title": title})
        if existing_job and str(existing_job.get("_id")) != job_id:
            app_logger.warning("Duplicate job title detected: %s", title)
            raise DuplicateJobTitleException("Job title already exists.")
        update_data["title"] = title

    if payload.description:
        update_data["description"] = payload.description.strip()
    
    if payload.requirements:
        update_data["requirements"] = payload.requirements.strip()
    
    if payload.location:
        update_data["location"] = payload.location.strip()
    
    if payload.employment_type:
        update_data["employment_type"] = payload.employment_type.strip()
    
    if payload.salary_range:
        update_data["salary_range"] = payload.salary_range.strip()
    
    if payload.department:
        update_data["department"] = payload.department.strip()
    
    if payload.experience_level:
        update_data["experience_level"] = payload.experience_level.strip()

    try:
        job_repository.update_job(job_id, update_data)
    except PyMongoError:
        app_logger.exception("Failed to update job: %s", job_id)
        raise

    updated_job = job_repository.get_job_by_id(job_id)
    return _build_job_response(updated_job)