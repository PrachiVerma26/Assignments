from datetime import datetime, date, time
from typing import Optional
from pydantic import BaseModel, Field
from src.enums.interview_status import InterviewStatus
from src.enums.recommendation import Recommendation

class Interview(BaseModel):
    candidate_id: str
    interviewer_id: str
    interview_date: date
    interview_time: time
    status: InterviewStatus = InterviewStatus.SCHEDULED
    technical_rating: int | None = None
    communication_rating: int | None = None
    comments: str | None = None
    recommendation: Recommendation | None = None
    created_at: datetime = Field(default_factory = datetime.utcnow)
    updated_at: datetime = Field(default_factory = datetime.utcnow)
