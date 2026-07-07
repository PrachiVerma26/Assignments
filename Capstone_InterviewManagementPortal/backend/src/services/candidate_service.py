"""Candidate Service: Complete Candidate Management implementation with all CRUD operations."""

from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from src.enums.candidate_status import CandidateStatus
from src.exceptions.candidate_exceptions import CandidateEmailAlreadyExistsException, CandidateMobileAlreadyExistsException, InvalidNucleusTeqEmailException, CandidateNotFoundException
from src.models.candidate import Candidate
from src.repositories import candidate_repository
from src.schemas.response.candidate_response import CandidateResponse, CandidateListResponse, CreateCandidateResponse
from src.utils.logger import app_logger

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

async def _build_candidate_response(candidate: dict) -> CandidateResponse:
    """Convert a candidate document to a CandidateResponse."""
    return CandidateResponse(
        id=str(candidate["_id"]),
        first_name=candidate["first_name"],
        last_name=candidate["last_name"],
        email=candidate["email"],
        mobile=candidate["mobile"],
        current_company=candidate["current_company"],
        total_experience=candidate["total_experience"],
        applied_job_id=candidate["applied_job_id"],
        status=candidate["status"],
        resume_file_id=candidate.get("resume_file_id"),
        created_at=candidate["created_at"],
        updated_at=candidate.get("updated_at"),
    )

async def create_candidate(candidate_request, current_user) -> CreateCandidateResponse:
    """Create a new candidate profile."""
    app_logger.info("Create candidate request received for: %s", candidate_request.email)
    if not candidate_request.email.endswith("@nucleusteq.com"):
        raise InvalidNucleusTeqEmailException("Only @nucleusteq.com email addresses are allowed.")
    if await candidate_repository.get_candidate_by_email(candidate_request.email):
        app_logger.warning("Duplicate candidate email detected: %s", candidate_request.email)
        raise CandidateEmailAlreadyExistsException("Email already exists.")
    if await candidate_repository.get_candidate_by_mobile(candidate_request.mobile):
        app_logger.warning("Duplicate candidate mobile detected: %s", candidate_request.mobile)
        raise CandidateMobileAlreadyExistsException("Mobile number already exists.")

    candidate = Candidate(**candidate_request.model_dump(), status=CandidateStatus.PROFILE_CREATED, created_by=str(current_user["_id"]))
    result = await candidate_repository.create_candidate(candidate.model_dump())
    created = candidate.model_dump()
    created["_id"] = result.inserted_id
    app_logger.info("Candidate created successfully: %s", result.inserted_id)
    return CreateCandidateResponse(message="Candidate created successfully.", candidate=_build_candidate_response(created))

async def get_candidate_by_id(candidate_id: str) -> CandidateResponse:
    """Get candidate by ID."""
    app_logger.info("Fetching candidate by ID: %s", candidate_id)
    candidate = await _get_candidate_or_raise(candidate_id)
    app_logger.info("Candidate found: %s", candidate["email"])
    return _build_candidate_response(candidate)

async def get_candidates(page: int = 1, limit: int = 10, search: str | None = None) -> CandidateListResponse:
    """List candidates with pagination and optional search."""
    app_logger.info("Fetching candidates - page: %d, limit: %d", page, limit)
    result = await candidate_repository.get_candidates(page, limit, search)
    candidates = [_build_candidate_response(c) for c in result["candidates"]]
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
        if not update_data["email"].endswith("@nucleusteq.com"):
            raise InvalidNucleusTeqEmailException("Only @nucleusteq.com email addresses are allowed.")
        existing = await candidate_repository.get_candidate_by_email(update_data["email"])
        if existing and str(existing["_id"]) != candidate_id:
            app_logger.warning("Duplicate candidate email detected: %s", update_data["email"])
            raise CandidateEmailAlreadyExistsException("Email already exists.")

    if "mobile" in update_data:
        existing = await candidate_repository.get_candidate_by_mobile(update_data["mobile"])
        if existing and str(existing["_id"]) != candidate_id:
            app_logger.warning("Duplicate candidate mobile detected: %s", update_data["mobile"])
            raise CandidateMobileAlreadyExistsException("Mobile number already exists.")

    update_data["updated_at"] = datetime.utcnow()
    await candidate_repository.update_candidate(candidate_id, update_data)

    updated = await candidate_repository.get_candidate_by_id(candidate_id)
    app_logger.info("Candidate updated successfully: %s", candidate_id)
    return _build_candidate_response(updated)
