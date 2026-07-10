from datetime import datetime, date, time
from typing import List
from pydantic import BaseModel
from src.enums.interview_mode import InterviewMode
from src.enums.interview_status import InterviewStatus
from src.enums.recommendation import Recommendation

class CandidateSummaryResponse(BaseModel):
    id: str
    name: str

class InterviewerSummaryResponse(BaseModel):
    id: str
    name: str

class JobSummaryResponse(BaseModel):
    id: str
    title: str

class SchedulingFormDataResponse(BaseModel):
    candidates: List[CandidateSummaryResponse]
    interviewers: List[InterviewerSummaryResponse]

class InterviewResponse(BaseModel):
    id: str
    candidate: CandidateSummaryResponse
    interviewer: InterviewerSummaryResponse
    job: JobSummaryResponse
    interview_date: date
    interview_time: time
    interview_mode: InterviewMode
    meeting_link: str | None = None
    location: str | None = None
    status: InterviewStatus
    technical_rating: int | None = None
    communication_rating: int | None = None
    comments: str | None = None
    recommendation: Recommendation | None = None
    created_at: datetime
    updated_at: datetime | None = None
    created_by: str | None = None
    updated_by: str | None = None

class CreateInterviewResponse(BaseModel):
    message: str
    interview: InterviewResponse

class InterviewListResponse(BaseModel):
    message: str
    interviews: List[InterviewResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class InterviewDetailResponse(BaseModel):
    message: str
    interview: InterviewResponse

class FeedbackResponse(BaseModel):
    message: str
    interview_id: str
    technical_rating: int
    communication_rating: int
    comments: str
    recommendation: Recommendation

class HRDashboardResponse(BaseModel):
    total_jobs: int
    total_candidates: int
    scheduled_interviews: int
    selected_candidates: int
    rejected_candidates: int

class AdminDashboardResponse(BaseModel):
    total_users: int
    total_jobs: int
    total_candidates: int
    scheduled_interviews: int

class InterviewerDashboardResponse(BaseModel):
    assigned_interviews: int
    pending_feedback: int
    completed_feedback: int