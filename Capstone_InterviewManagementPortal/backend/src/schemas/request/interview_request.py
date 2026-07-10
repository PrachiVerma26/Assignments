from datetime import date, time
from pydantic import BaseModel, Field, field_validator
from src.enums.interview_mode import InterviewMode
from src.enums.recommendation import Recommendation

class ScheduleInterviewRequest(BaseModel):
    """Request model for scheduling an interview."""
    candidate_id: str
    interviewer_id: str
    interview_date: date
    interview_time: time
    interview_mode: InterviewMode
    meeting_link: str | None = None
    location: str | None = None

    @field_validator("interview_time", mode="after")
    @classmethod
    def strip_timezone(cls, v: time) -> time:
        return v.replace(tzinfo=None)

class UpdateInterviewRequest(BaseModel):
    """Request model for updating an interview."""
    interviewer_id: str | None = None
    interview_date: date | None = None
    interview_time: time | None = None
    interview_mode: InterviewMode | None = None
    meeting_link: str | None = None
    location: str | None = None

    @field_validator("interview_time", mode="after")
    @classmethod
    def strip_timezone(cls, v: time | None) -> time | None:
        return v.replace(tzinfo=None) if v is not None else v

class SubmitFeedbackRequest(BaseModel):
    """Request model for submitting an interview."""
    technical_rating: int = Field(..., ge=1, le=5)
    communication_rating: int = Field(...,ge = 1, le = 5)
    comments: str
    recommendation: Recommendation
