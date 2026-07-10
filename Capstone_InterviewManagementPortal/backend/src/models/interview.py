from datetime import datetime
from pydantic import BaseModel, Field
from src.enums.interview_mode import InterviewMode
from src.enums.interview_status import InterviewStatus
from src.enums.recommendation import Recommendation

class Interview(BaseModel):
    candidate_id: str
    interviewer_id: str
    interview_datetime: datetime
    interview_mode: InterviewMode
    meeting_link: str | None = None
    location: str | None = None
    status: InterviewStatus = InterviewStatus.SCHEDULED
    technical_rating: int | None = None
    communication_rating: int | None = None
    comments: str | None = None
    recommendation: Recommendation | None = None
    created_at: datetime = Field(default_factory = datetime.utcnow)
    updated_at: datetime | None = None
    created_by: str | None = None
    updated_by: str | None = None
