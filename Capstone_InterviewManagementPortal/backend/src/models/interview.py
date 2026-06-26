from datetime import (datetime, date, time)
from pydantic import (BaseModel, Field)
from src.enums.interview_status import (InterviewStatus)

class Interview(BaseModel):
    """
    Represents an interview scheduled for a candidate.
    An interview can contain feedback, rating, comments and recommendation.
    """

    # Reference to Candidate document.
    candidate_id: str

    # Reference to User document.
    interviewer_id: str

    interview_date: date

    interview_time: time

    status: InterviewStatus

    rating: int | None = None

    comments: str | None = None

    recommendation: str | None = None

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )