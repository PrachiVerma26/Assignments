"""Candidate Router: Provides REST endpoints for managing candidates."""

from typing import Optional
from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from fastapi.responses import StreamingResponse

from src.enums.candidate_status import CandidateStatus
from src.enums.role_types import UserRole
from src.schemas.request.candidate_request import CreateCandidateRequest, UpdateCandidateRequest
from src.schemas.response.candidate_response import (
    CandidateListResponse,
    CandidateResponse,
    CandidateStatusUpdateResponse,
    CreateCandidateResponse,
    ResumeUploadResponse,
    StatusHistoryResponse,
)
from src.services import candidate_service
from src.utils.logger import app_logger
from src.utils.security import get_current_user, require_roles

router = APIRouter(prefix="/candidates", tags=["Candidate Management"])


@router.post("", response_model=CreateCandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(payload: CreateCandidateRequest, current_user=Depends(get_current_user)):
    """Create a candidate profile. Accessible only by HR users."""
    require_roles(current_user, [UserRole.HR])
    app_logger.info("Create candidate endpoint invoked by %s", current_user["email"])
    return candidate_service.create_candidate(payload, current_user)


@router.get("", response_model=CandidateListResponse)
def get_candidates(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    current_user=Depends(get_current_user),
):
    """Retrieve candidates with pagination and search."""
    require_roles(current_user, [UserRole.HR])
    app_logger.info("List candidates endpoint invoked.")
    return candidate_service.get_candidates(page, limit, search)


@router.get("/{candidate_id}/resume")
def view_resume(candidate_id: str, current_user=Depends(get_current_user)):
    """Stream the resume PDF for a candidate."""
    require_roles(current_user, [UserRole.HR])
    app_logger.info("Resume view endpoint invoked for candidate: %s", candidate_id)
    grid_file = candidate_service.get_resume(candidate_id)
    return StreamingResponse(
        grid_file,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={grid_file.filename}"},
    )


@router.get("/{candidate_id}/status/history", response_model=StatusHistoryResponse)
def get_status_history(candidate_id: str, current_user=Depends(get_current_user)):
    """Retrieve the full status history for a candidate."""
    require_roles(current_user, [UserRole.HR])
    app_logger.info("Status history endpoint invoked for candidate: %s", candidate_id)
    return candidate_service.get_status_history(candidate_id)


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: str, current_user=Depends(get_current_user)):
    """Retrieve a candidate by ID."""
    require_roles(current_user, [UserRole.HR])
    app_logger.info("Fetching candidate: %s", candidate_id)
    return candidate_service.get_candidate_by_id(candidate_id)


@router.put("/{candidate_id}", response_model=CandidateResponse)
def update_candidate(candidate_id: str, payload: UpdateCandidateRequest, current_user=Depends(get_current_user)):
    """Update candidate details."""
    require_roles(current_user, [UserRole.HR])
    app_logger.info("Updating candidate: %s", candidate_id)
    return candidate_service.update_candidate(candidate_id, payload)


@router.post("/{candidate_id}/resume", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_resume(candidate_id: str, file: UploadFile = File(...), current_user=Depends(get_current_user)):
    """Upload or replace a PDF resume for a candidate."""
    require_roles(current_user, [UserRole.HR])
    app_logger.info("Resume upload endpoint invoked for candidate: %s", candidate_id)
    return candidate_service.upload_resume(candidate_id, file)


@router.patch("/{candidate_id}/status", response_model=CandidateStatusUpdateResponse)
def update_candidate_status(
    candidate_id: str,
    new_status: CandidateStatus = Query(..., description="New candidate status"),
    current_user=Depends(get_current_user),
):
    """Update the status of a candidate."""
    require_roles(current_user, [UserRole.HR])
    app_logger.info("Status update endpoint invoked for candidate: %s", candidate_id)
    return candidate_service.update_candidate_status(candidate_id, new_status, current_user)
