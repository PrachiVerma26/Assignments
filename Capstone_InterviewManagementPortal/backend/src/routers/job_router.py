"""
Job Router: Provides REST endpoints for managing job descriptions.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from src.enums.role_types import UserRole
from src.schemas.request.job_request import CreateJobRequest, UpdateJobRequest
from src.schemas.response.job_response import CreateJobResponse, JobListResponse, JobResponse, JobDetailResponse
from src.services import job_service
from src.utils.logger import app_logger
from src.utils.security import get_current_user, require_roles

router = APIRouter(prefix="/jobs", tags=["Job Management"])

@router.post("", response_model=CreateJobResponse, status_code=status.HTTP_201_CREATED)
def create_job(payload: CreateJobRequest, current_user=Depends(get_current_user)):
    """ Create a new job description also accessible by HR only."""
    require_roles( current_user,[UserRole.HR])
    app_logger.info("Create job endpoint invoked by %s", current_user["email"])
    return job_service.create_new_job(payload)

@router.get("", response_model=JobListResponse)
def get_jobs(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by title, description, department, or location"),
    current_user=Depends(get_current_user)
):
    """Retrieve job descriptions with pagination and search."""
    require_roles(current_user, [UserRole.HR])
    app_logger.info("List jobs endpoint invoked.")
    return job_service.list_jobs(page, limit, search)

@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job(job_id: str, current_user=Depends(get_current_user)):
    """Retrieve a job description by ID."""
    require_roles(current_user, [ UserRole.HR])
    app_logger.info("Fetching job: %s", job_id)
    return job_service.get_job_by_id(job_id)

@router.put("/{job_id}", response_model=JobResponse)
def update_existing_job(job_id: str, payload: UpdateJobRequest, current_user=Depends(get_current_user)):
    """Update job description details."""
    require_roles(current_user, [ UserRole.HR])
    app_logger.info("Updating job: %s", job_id)
    return job_service.update_job(job_id, payload)