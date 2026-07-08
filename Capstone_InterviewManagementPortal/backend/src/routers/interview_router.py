from fastapi import APIRouter, Depends, Query, status
from src.enums.role_types import UserRole
from src.schemas.request.interview_request import ScheduleInterviewRequest, SubmitFeedbackRequest, UpdateInterviewRequest
from src.schemas.response.interview_response import (
    CreateInterviewResponse,
    FeedbackResponse,
    HRDashboardResponse,
    InterviewDetailResponse,
    InterviewListResponse,
    InterviewResponse,
    InterviewerDashboardResponse,
)
from src.services import interview_service
from src.utils.logger import app_logger
from src.utils.security import get_current_user, require_roles

router = APIRouter(prefix="/interviews", tags=["Interview Management"])

@router.post("", response_model=CreateInterviewResponse, status_code=status.HTTP_201_CREATED)
async def schedule_interview(payload: ScheduleInterviewRequest, current_user=Depends(get_current_user)):
    require_roles(current_user, [UserRole.HR])
    app_logger.info("Schedule interview endpoint invoked by %s", current_user["email"])
    return await interview_service.schedule_interview(payload, current_user)

@router.get("", response_model=InterviewListResponse)
async def get_interviews(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user=Depends(get_current_user),
):
    require_roles(current_user, [UserRole.HR, UserRole.INTERVIEWER])
    app_logger.info("List interviews endpoint invoked.")
    return await interview_service.get_interviews(page, limit)

@router.get("/dashboard/hr", response_model=HRDashboardResponse)
async def hr_dashboard(current_user=Depends(get_current_user)):
    require_roles(current_user, [UserRole.HR])
    app_logger.info("HR dashboard endpoint invoked by %s", current_user["email"])
    return await interview_service.get_hr_dashboard()

@router.get("/dashboard/interviewer", response_model=InterviewerDashboardResponse)
async def interviewer_dashboard(current_user=Depends(get_current_user)):
    require_roles(current_user, [UserRole.INTERVIEWER])
    app_logger.info("Interviewer dashboard endpoint invoked by %s", current_user["email"])
    return await interview_service.get_interviewer_dashboard(current_user)

@router.get("/{interview_id}", response_model=InterviewDetailResponse)
async def get_interview(interview_id: str, current_user=Depends(get_current_user)):
    require_roles(current_user, [UserRole.HR, UserRole.INTERVIEWER])
    app_logger.info("Fetching interview: %s", interview_id)
    return await interview_service.get_interview_by_id(interview_id)

@router.put("/{interview_id}", response_model=InterviewResponse)
async def update_interview(interview_id: str, payload: UpdateInterviewRequest, current_user=Depends(get_current_user)):
    require_roles(current_user, [UserRole.HR, UserRole.INTERVIEWER])
    app_logger.info("Updating interview: %s", interview_id)
    return await interview_service.update_interview(interview_id, payload, current_user)

@router.post("/{interview_id}/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(interview_id: str, payload: SubmitFeedbackRequest, current_user=Depends(get_current_user)):
    require_roles(current_user, [UserRole.INTERVIEWER])
    app_logger.info("Feedback submission endpoint invoked for interview: %s", interview_id)
    return await interview_service.submit_feedback(interview_id, payload, current_user)

@router.get("/{interview_id}/feedback", response_model=FeedbackResponse)
async def get_feedback(interview_id: str, current_user=Depends(get_current_user)):
    require_roles(current_user, [UserRole.HR, UserRole.INTERVIEWER])
    app_logger.info("Fetching feedback for interview: %s", interview_id)
    return await interview_service.get_feedback(interview_id)
