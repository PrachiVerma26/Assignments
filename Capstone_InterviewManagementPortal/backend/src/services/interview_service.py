from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from src.enums.candidate_status import CandidateStatus
from src.enums.interview_mode import InterviewMode
from src.enums.interview_status import InterviewStatus
from src.enums.role_types import UserRole
from src.exceptions import candidate_exceptions, interview_exceptions
from src.models.interview import Interview
from src.repositories import candidate_repository, interview_repository, job_repository, user_repository
from src.schemas.response import interview_response
from src.utils.logger import app_logger

async def _get_interview_or_raise(interview_id: str) -> dict:
    try:
        ObjectId(interview_id)
    except InvalidId:
        raise interview_exceptions.InterviewNotFoundException("Interview not found.")
    interview = await interview_repository.get_interview_by_id(interview_id)
    if not interview:
        raise interview_exceptions.InterviewNotFoundException("Interview not found.")
    return interview

def _enum_value(value):
    return value.value if hasattr(value, "value") else value

def _interview_datetime(interview: dict) -> datetime:
    interview_datetime = interview["interview_datetime"]
    if isinstance(interview_datetime, str):
        return datetime.fromisoformat(interview_datetime)
    return interview_datetime

async def _build_interview_response(interview: dict) -> interview_response.InterviewResponse:
    candidate = None
    interviewer = None
    candidate_id = interview.get("candidate_id")
    interviewer_id = interview.get("interviewer_id")
    if candidate_id:
        candidate = await candidate_repository.get_candidate_by_id(candidate_id)
    if interviewer_id:
        interviewer = await user_repository.find_user_by_id(interviewer_id)
    interview_datetime = _interview_datetime(interview)
    candidate_name = "Unknown Candidate"
    if candidate:
        full_name = f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}".strip()
        candidate_name = full_name or candidate_name
    interviewer_name = "Unknown Interviewer"
    if interviewer:
        interviewer_name = interviewer.get("name") or interviewer_name
    job = None
    job_title = "N/A"
    if candidate and candidate.get("applied_job_id"):
        try:
            job = await job_repository.get_job_by_id(candidate["applied_job_id"])
        except (InvalidId, TypeError, ValueError):
            job = None
    if job:
        job_title = job.get("title") or job_title

    return interview_response.InterviewResponse(
        id=str(interview["_id"]),
        candidate=interview_response.CandidateSummaryResponse(id="", name=candidate_name),
        interviewer=interview_response.InterviewerSummaryResponse(id="", name=interviewer_name),
        job=interview_response.JobSummaryResponse(id="", title=job_title),
        interview_date=interview_datetime.date(),
        interview_time=interview_datetime.time(),
        interview_mode=interview["interview_mode"],
        meeting_link=interview.get("meeting_link"),
        location=interview.get("location"),
        status=interview["status"],
        technical_rating=interview.get("technical_rating"),
        communication_rating=interview.get("communication_rating"),
        comments=interview.get("comments"),
        recommendation=interview.get("recommendation"),
        created_at=interview["created_at"],
        updated_at=interview.get("updated_at"),
        created_by=interview.get("created_by"),
        updated_by=interview.get("updated_by"),
    )

async def _validate_interviewer(interviewer_id: str) -> dict:
    try:
        ObjectId(interviewer_id)
    except InvalidId:
        raise interview_exceptions.InvalidInterviewerException("Interviewer not found.")
    interviewer = await user_repository.find_user_by_id(interviewer_id)
    if not interviewer:
        raise interview_exceptions.InvalidInterviewerException("Interviewer not found.")
    role = _enum_value(interviewer["role"])
    if role != UserRole.INTERVIEWER.value:
        raise interview_exceptions.InvalidInterviewerException("Assigned user does not have the INTERVIEWER role.")
    return interviewer

async def _validate_candidate(candidate_id: str) -> dict:
    try:
        ObjectId(candidate_id)
    except InvalidId:
        raise candidate_exceptions.CandidateNotFoundException("Candidate not found.")
    candidate = await candidate_repository.get_candidate_by_id(candidate_id)
    if not candidate:
        raise candidate_exceptions.CandidateNotFoundException("Candidate not found.")
    return candidate

def _validate_interview_datetime(interview_datetime: datetime):
    app_logger.info("Interview datetime: %s | tzinfo=%s", interview_datetime,interview_datetime.tzinfo)
    app_logger.info("Current UTC: %s | tzinfo=%s", datetime.utcnow(),datetime.utcnow().tzinfo)

    if interview_datetime < datetime.utcnow():
        raise interview_exceptions.InvalidInterviewDateException("Interview date and time cannot be in the past.")
def _validate_mode_fields(interview_mode: InterviewMode, meeting_link, location):
    interview_mode = _enum_value(interview_mode)
    if interview_mode == InterviewMode.ONLINE.value and not meeting_link:
        raise interview_exceptions.MeetingLinkRequiredException("Meeting link is required for online interviews.")
    if interview_mode == InterviewMode.OFFLINE.value and not location:
        raise interview_exceptions.LocationRequiredException("Location is required for offline interviews.")

async def _validate_schedule_conflicts(candidate_id: str, interviewer_id: str, interview_datetime: datetime):
    candidate_interview = await interview_repository.get_candidate_interview(candidate_id, interview_datetime)
    if candidate_interview:
        raise interview_exceptions.InvalidInterviewDateException("Candidate already has an interview scheduled at this date and time.")
    interviewer_interview = await interview_repository.get_interviewer_interview(interviewer_id, interview_datetime)
    if interviewer_interview:
        raise interview_exceptions.InvalidInterviewDateException("Interviewer already has an interview scheduled at this date and time.")

async def _validate_update_conflicts(interview_id: str, candidate_id: str, interviewer_id: str, interview_datetime: datetime):
    candidate_interview = await interview_repository.get_candidate_interview_except(candidate_id, interview_datetime, interview_id)
    if candidate_interview:
        raise interview_exceptions.InvalidInterviewDateException("Candidate already has an interview scheduled at this date and time.")
    interviewer_interview = await interview_repository.get_interviewer_interview_except(interviewer_id, interview_datetime, interview_id)
    if interviewer_interview:
        raise interview_exceptions.InvalidInterviewDateException("Interviewer already has an interview scheduled at this date and time.")

async def schedule_interview(payload, current_user: dict) -> interview_response.CreateInterviewResponse:
    app_logger.info("Schedule interview request received for candidate: %s", payload.candidate_id)
    await _validate_candidate(payload.candidate_id)
    await _validate_interviewer(payload.interviewer_id)
    interview_datetime = datetime.combine(payload.interview_date, payload.interview_time)
    _validate_interview_datetime(interview_datetime)
    _validate_mode_fields(payload.interview_mode, payload.meeting_link, payload.location)
    await _validate_schedule_conflicts(payload.candidate_id, payload.interviewer_id, interview_datetime)

    interview = Interview(
        candidate_id=payload.candidate_id,
        interviewer_id=payload.interviewer_id,
        interview_datetime=interview_datetime,
        interview_mode=payload.interview_mode,
        meeting_link=payload.meeting_link,
        location=payload.location,
        status=InterviewStatus.SCHEDULED,
        created_by=str(current_user["_id"]),
    )
    data = interview.model_dump()
    result = await interview_repository.create_interview(data)
    created = data.copy()
    created["_id"] = result.inserted_id
    app_logger.info("Interview scheduled successfully: %s", result.inserted_id)
    return interview_response.CreateInterviewResponse(message="Interview scheduled successfully.", interview=await _build_interview_response(created))

async def get_interviews(page: int = 1, limit: int = 10, current_user: dict | None = None) -> interview_response.InterviewListResponse:
    app_logger.info("Fetching interviews - page: %d, limit: %d", page, limit)
    interviewer_id = None
    if current_user:
        current_role = _enum_value(current_user["role"])
        if current_role == UserRole.INTERVIEWER.value:
            interviewer_id = str(current_user["_id"])
    result = await interview_repository.get_interviews(page, limit, interviewer_id=interviewer_id)
    interviews = []
    for interview in result["interviews"]:
        try:
            interviews.append(await _build_interview_response(interview))
        except (KeyError, TypeError, ValueError, InvalidId) as exc:
            app_logger.warning("Skipping malformed interview record %s: %s", interview.get("_id"), exc)

    return interview_response.InterviewListResponse(
        message="Interviews retrieved successfully.",
        interviews=interviews,
        total=result["total"],
        page=result["page"],
        limit=result["limit"],
        total_pages=result["total_pages"],
    )

async def get_interview_by_id(interview_id: str) -> interview_response.InterviewDetailResponse:
    app_logger.info("Fetching interview by ID: %s", interview_id)
    interview = await _get_interview_or_raise(interview_id)
    return interview_response.InterviewDetailResponse(message="Interview retrieved successfully.", interview=await _build_interview_response(interview))

async def update_interview(interview_id: str, payload, current_user: dict) -> interview_response.InterviewResponse:
    app_logger.info("Update interview request received for: %s", interview_id)
    interview = await _get_interview_or_raise(interview_id)
    update_data = payload.model_dump(exclude_unset=True)
    current_role = _enum_value(current_user["role"])
    if current_role == UserRole.INTERVIEWER.value:
        if interview["interviewer_id"] != str(current_user["_id"]):
            raise interview_exceptions.InvalidInterviewerException("Only the assigned interviewer can reschedule this interview.")
        allowed_fields = {"interview_date", "interview_time"}
        if any(field not in allowed_fields for field in update_data):
            raise interview_exceptions.InvalidInterviewerException("Interviewers can only reschedule interview date and time.")
    current_datetime = _interview_datetime(interview)
    interviewer_id = update_data.get("interviewer_id", interview["interviewer_id"])
    datetime_changed = "interview_date" in update_data or "interview_time" in update_data
    interviewer_changed = "interviewer_id" in update_data and update_data["interviewer_id"] != interview["interviewer_id"]

    if interviewer_changed:
        await _validate_interviewer(interviewer_id)
    if datetime_changed:
        interview_date = update_data.pop("interview_date", current_datetime.date())
        interview_time = update_data.pop("interview_time", current_datetime.time())
        interview_datetime = datetime.combine(interview_date, interview_time)
        _validate_interview_datetime(interview_datetime)
        update_data["interview_datetime"] = interview_datetime
    else:
        interview_datetime = current_datetime

    if datetime_changed or interviewer_changed:
        await _validate_update_conflicts(interview_id, interview["candidate_id"], interviewer_id, interview_datetime)

    mode_changed = "interview_mode" in update_data or "meeting_link" in update_data or "location" in update_data
    if mode_changed:
        interview_mode = update_data.get("interview_mode", interview["interview_mode"])
        meeting_link = update_data.get("meeting_link", interview.get("meeting_link"))
        location = update_data.get("location", interview.get("location"))
        _validate_mode_fields(interview_mode, meeting_link, location)

    update_data["updated_at"] = datetime.utcnow()
    update_data["updated_by"] = str(current_user["_id"])
    await interview_repository.update_interview(interview_id, update_data)
    updated = await interview_repository.get_interview_by_id(interview_id)
    app_logger.info("Interview updated successfully: %s", interview_id)
    return await _build_interview_response(updated)

async def submit_feedback(interview_id: str, payload, current_user: dict) -> interview_response.FeedbackResponse:
    app_logger.info("Feedback submission requested for interview: %s", interview_id)
    interview = await _get_interview_or_raise(interview_id)
    if interview["interviewer_id"] != str(current_user["_id"]):
        raise interview_exceptions.InvalidInterviewerException("Only the assigned interviewer can submit feedback.")
    if interview.get("technical_rating") is not None or interview.get("communication_rating") is not None:
        raise interview_exceptions.FeedbackAlreadySubmittedException("Feedback has already been submitted for this interview.")
    update_data = {
        "technical_rating": payload.technical_rating,
        "communication_rating": payload.communication_rating,
        "comments": payload.comments,
        "recommendation": payload.recommendation,
        "status": InterviewStatus.COMPLETED.value,
        "updated_at": datetime.utcnow(),
        "updated_by": str(current_user["_id"]),
    }
    await interview_repository.update_interview(interview_id, update_data)
    app_logger.info("Feedback submitted for interview: %s", interview_id)
    return interview_response.FeedbackResponse(
        message="Feedback submitted successfully.",
        interview_id=interview_id,
        technical_rating=payload.technical_rating,
        communication_rating=payload.communication_rating,
        comments=payload.comments,
        recommendation=payload.recommendation,
    )

async def get_feedback(interview_id: str) -> interview_response.FeedbackResponse:
    app_logger.info("Fetching feedback for interview: %s", interview_id)
    interview = await _get_interview_or_raise(interview_id)
    if interview.get("technical_rating") is None or interview.get("communication_rating") is None:
        raise interview_exceptions.InterviewNotFoundException("No feedback found for this interview.")
    return interview_response.FeedbackResponse(
        message="Feedback retrieved successfully.",
        interview_id=interview_id,
        technical_rating=interview["technical_rating"],
        communication_rating=interview["communication_rating"],
        comments=interview["comments"],
        recommendation=interview["recommendation"],
    )

async def get_hr_dashboard() -> interview_response.HRDashboardResponse:
    app_logger.info("Fetching HR dashboard data.")
    total_jobs = await job_repository.get_job_collection().count_documents({})
    total_candidates = await candidate_repository.get_candidate_collection().count_documents({})
    scheduled_interviews = await interview_repository.count_scheduled_interviews()
    selected_candidates = await candidate_repository.get_candidate_collection().count_documents({"status": CandidateStatus.HIRED.value})
    rejected_candidates = await candidate_repository.get_candidate_collection().count_documents({"status": CandidateStatus.REJECTED.value})
    return interview_response.HRDashboardResponse(
        total_jobs=total_jobs,
        total_candidates=total_candidates,
        scheduled_interviews=scheduled_interviews,
        selected_candidates=selected_candidates,
        rejected_candidates=rejected_candidates,
    )

async def get_interviewer_dashboard(current_user: dict) -> interview_response.InterviewerDashboardResponse:
    interviewer_id = str(current_user["_id"])
    app_logger.info("Fetching interviewer dashboard for: %s", interviewer_id)
    assigned_interviews = await interview_repository.count_assigned_interviews(interviewer_id)
    pending_feedback = await interview_repository.count_pending_feedback(interviewer_id)
    completed_feedback = await interview_repository.count_completed_feedback(interviewer_id)
    return interview_response.InterviewerDashboardResponse( assigned_interviews=assigned_interviews, pending_feedback=pending_feedback, completed_feedback=completed_feedback)

async def get_scheduling_form_data() -> interview_response.SchedulingFormDataResponse:
    app_logger.info("Fetching scheduling form data.")
    candidates_result = await candidate_repository.get_candidates(page=1, limit=1000)
    users_result = await user_repository.find_users_paginated(page=1, limit=1000, active=True, role=UserRole.INTERVIEWER)
    
    candidates = [
        interview_response.CandidateSummaryResponse(id=str(c["_id"]), name=f"{c.get('first_name', '')} {c.get('last_name', '')}".strip())
        for c in candidates_result["candidates"]
    ]
    
    interviewers = [
        interview_response.InterviewerSummaryResponse(id=str(u["_id"]), name=u.get("name", ""))
        for u in users_result["users"]
    ]
    
    return interview_response.SchedulingFormDataResponse(candidates=candidates, interviewers=interviewers)