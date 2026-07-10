"""Candidate Service: Complete Candidate Management implementation with all CRUD operations."""

from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import UploadFile

from src.enums.candidate_status import CandidateStatus
from src.exceptions.candidate_exceptions import (
    CandidateEmailAlreadyExistsException,
    CandidateMobileAlreadyExistsException,
    CandidateNotFoundException,
    AppliedJobNotFoundException,
    ResumeNotFoundException,
    InvalidFileTypeException,
    EmptyFileException,
    ResumeUploadFailedException,
)
from src.models.candidate import Candidate
from src.repositories import candidate_repository, job_repository
from src.schemas.response.candidate_response import (
    CandidateResponse,
    CandidateListResponse,
    CreateCandidateResponse,
    ResumeUploadResponse,
    CandidateStatusUpdateResponse,
    StatusHistoryResponse,
    StatusHistoryEntry,
    JobSummaryResponse,
)
from src.utils.logger import app_logger

_PDF_CONTENT_TYPE = "application/pdf"

async def _get_candidate_or_raise(candidate_id: str) -> dict:
    """Retrieve a candidate by ID or raise CandidateNotFoundException."""
    try:
        ObjectId(candidate_id)
    except InvalidId:
        raise CandidateNotFoundException("Candidate not found.")
    candidate = await candidate_repository.get_candidate_by_id(candidate_id)
    if not candidate:
        raise CandidateNotFoundException("Candidate not found.")
    return candidate

async def _get_job_or_raise(job_id: str) -> dict:
    """Retrieve a job by ID or raise AppliedJobNotFoundException."""
    try:
        ObjectId(job_id)
    except InvalidId:
        app_logger.warning("Invalid ObjectId for applied_job_id: %s", job_id)
        raise AppliedJobNotFoundException("Applied job not found.")
    job = await job_repository.get_job_by_id(job_id)
    if not job:
        app_logger.warning("Applied job not found for id: %s", job_id)
        raise AppliedJobNotFoundException("Applied job not found.")
    return job

async def _build_candidate_response(candidate: dict, skip_job_validation: bool = False) -> CandidateResponse:
    """Convert a candidate document to a CandidateResponse."""
    job = None
    if not skip_job_validation:
        try:
            job = await _get_job_or_raise(candidate["applied_job_id"])
        except AppliedJobNotFoundException:
            app_logger.warning("Invalid job reference for candidate %s: %s", candidate["_id"], candidate["applied_job_id"])
            job = None
    
    job_summary = JobSummaryResponse(id=str(job["_id"]), title=job["title"]) if job else JobSummaryResponse(id=candidate.get("applied_job_id", "unknown"), title="Unknown Job")
    
    return CandidateResponse(
        id=str(candidate["_id"]),
        first_name=candidate.get("first_name", "N/A"),
        last_name=candidate.get("last_name", "N/A"),
        email=candidate.get("email", "N/A"),
        mobile=candidate.get("mobile", "N/A"),
        current_company=candidate.get("current_company", "N/A"),
        experience_years=candidate.get("experience_years", 0),
        experience_months=candidate.get("experience_months", 0),
        applied_job=job_summary,
        status=candidate.get("status", "PROFILE_CREATED"),
        resume_file_id=candidate.get("resume_file_id"),
        created_at=candidate.get("created_at", datetime.utcnow()),
        updated_at=candidate.get("updated_at"),
    )

async def create_candidate(candidate_request, current_user) -> CreateCandidateResponse:
    """Create a new candidate profile."""
    app_logger.info("Create candidate request received for: %s", candidate_request.email)
    if await candidate_repository.get_candidate_by_email(candidate_request.email):
        app_logger.warning("Duplicate candidate email detected: %s", candidate_request.email)
        raise CandidateEmailAlreadyExistsException("Email already exists.")
    if await candidate_repository.get_candidate_by_mobile(candidate_request.mobile):
        app_logger.warning("Duplicate candidate mobile detected: %s", candidate_request.mobile)
        raise CandidateMobileAlreadyExistsException("Mobile number already exists.")

    # Verify job exists
    await _get_job_or_raise(candidate_request.applied_job_id)
    candidate = Candidate(**candidate_request.model_dump(), status=CandidateStatus.PROFILE_CREATED, created_by=str(current_user["_id"]))
    result = await candidate_repository.create_candidate(candidate.model_dump())
    created = candidate.model_dump()
    created["_id"] = result.inserted_id
    app_logger.info("Candidate created successfully: %s", result.inserted_id)
    return CreateCandidateResponse(message="Candidate created successfully.", candidate=await _build_candidate_response(created))

async def get_candidate_by_id(candidate_id: str) -> CandidateResponse:
    """Get candidate by ID."""
    app_logger.info("Fetching candidate by ID: %s", candidate_id)
    candidate = await _get_candidate_or_raise(candidate_id)
    app_logger.info("Candidate found: %s", candidate["email"])
    return await _build_candidate_response(candidate)

async def get_candidates(page: int = 1, limit: int = 10, search: str | None = None) -> CandidateListResponse:
    """List candidates with pagination and optional search."""
    app_logger.info("Fetching candidates - page: %d, limit: %d", page, limit)
    result = await candidate_repository.get_candidates(page, limit, search)
    candidates = [await _build_candidate_response(c, skip_job_validation=True) for c in result["candidates"]]
    return CandidateListResponse(
        message="Candidates retrieved successfully.",
        candidates=candidates,
        total=result["total"],
        page=result["page"],
        limit=result["limit"],
        total_pages=result["total_pages"],
    )

async def update_candidate(candidate_id: str, candidate_request) -> CandidateResponse:
    """Update candidate details."""
    app_logger.info("Update candidate request received for: %s", candidate_id)
    await _get_candidate_or_raise(candidate_id)
    update_data = candidate_request.model_dump(exclude_unset=True)

    if "email" in update_data:
        existing = await candidate_repository.get_candidate_by_email(update_data["email"])
        if existing and str(existing["_id"]) != candidate_id:
            app_logger.warning("Duplicate candidate email detected: %s", update_data["email"])
            raise CandidateEmailAlreadyExistsException("Email already exists.")

    if "mobile" in update_data:
        existing = await candidate_repository.get_candidate_by_mobile(update_data["mobile"])
        if existing and str(existing["_id"]) != candidate_id:
            app_logger.warning("Duplicate candidate mobile detected: %s", update_data["mobile"])
            raise CandidateMobileAlreadyExistsException("Mobile number already exists.")

    if "applied_job_id" in update_data:
        await _get_job_or_raise(update_data["applied_job_id"])

    update_data["updated_at"] = datetime.utcnow()
    await candidate_repository.update_candidate(candidate_id, update_data)

    updated = await candidate_repository.get_candidate_by_id(candidate_id)
    app_logger.info("Candidate updated successfully: %s", candidate_id)
    return await _build_candidate_response(updated)

async def upload_resume(candidate_id: str, file: UploadFile) -> ResumeUploadResponse:
    """Validate and upload a PDF resume to GridFS, replacing any existing one."""
    app_logger.info("Resume upload requested for candidate: %s", candidate_id)
    candidate = await _get_candidate_or_raise(candidate_id)
    if file.content_type != _PDF_CONTENT_TYPE:
        raise InvalidFileTypeException("Only PDF files are allowed.")
    file_data = await file.read()
    if not file_data:
        raise EmptyFileException("Uploaded file is empty.")

    try:
        existing_file_id = candidate.get("resume_file_id")
        if existing_file_id:
            await candidate_repository.delete_resume(existing_file_id)
        filename = file.filename or f"{candidate_id}.pdf"
        file_id = await candidate_repository.upload_resume(file_data, filename)
        await candidate_repository.update_candidate(candidate_id, {"resume_file_id": file_id, "updated_at": datetime.utcnow()})
    except (InvalidFileTypeException, EmptyFileException):
        raise
    except Exception as exc:
        app_logger.error("Resume upload failed for candidate %s: %s", candidate_id, exc)
        raise ResumeUploadFailedException("Resume upload failed.")
    app_logger.info("Resume uploaded successfully for candidate: %s, file_id: %s", candidate_id, file_id)
    return ResumeUploadResponse(message="Resume uploaded successfully.", resume_file_id=file_id)

async def get_resume(candidate_id: str):
    """Retrieve the GridFS file object for a candidate's resume."""
    app_logger.info("Resume view requested for candidate: %s", candidate_id)
    candidate = await _get_candidate_or_raise(candidate_id)
    file_id = candidate.get("resume_file_id")
    if not file_id:
        raise ResumeNotFoundException("No resume found for this candidate.")
    grid_file = await candidate_repository.get_resume(file_id)
    if not grid_file:
        raise ResumeNotFoundException("Resume file not found.")
    app_logger.info("Resume retrieved for candidate: %s", candidate_id)
    return grid_file

async def update_candidate_status(candidate_id: str, new_status: CandidateStatus, current_user: dict) -> CandidateStatusUpdateResponse:
    """Update candidate status and record history."""
    app_logger.info("Status update requested for candidate: %s to %s", candidate_id, new_status)
    candidate = await _get_candidate_or_raise(candidate_id)
    previous_status = candidate.get("status")
    if isinstance(previous_status, CandidateStatus):
        previous_status = previous_status.value
    history_entry = {
        "previous_status": previous_status,
        "new_status": new_status.value,
        "updated_at": datetime.utcnow(),
        "updated_by": str(current_user["_id"]),
    }
    await candidate_repository.update_candidate(candidate_id, {"status": new_status.value, "updated_at": datetime.utcnow()})
    await candidate_repository.push_status_history(candidate_id, history_entry)
    app_logger.info("Candidate %s status updated to %s", candidate_id, new_status)
    return CandidateStatusUpdateResponse(
        message="Candidate status updated successfully.",
        candidate_id=candidate_id,
        status=new_status,
    )

async def get_status_history(candidate_id: str) -> StatusHistoryResponse:
    """Retrieve the full status history for a candidate."""
    app_logger.info("Status history requested for candidate: %s", candidate_id)
    candidate = await _get_candidate_or_raise(candidate_id)
    raw_history = candidate.get("status_history", [])
    history = [
        StatusHistoryEntry(
            previous_status=entry.get("previous_status"),
            new_status=entry["new_status"],
            updated_at=entry["updated_at"],
            updated_by=entry.get("updated_by"),
        )
        for entry in raw_history
    ]
    return StatusHistoryResponse(candidate_id=candidate_id, status_history=history)