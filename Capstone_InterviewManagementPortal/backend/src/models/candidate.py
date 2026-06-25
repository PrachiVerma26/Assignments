from datetime import datetime
from pydantic import (BaseModel, EmailStr,Field)
from src.enums.candidate_status import (CandidateStatus)

class Candidate(BaseModel):
    """
    Represents a candidate applying for a job.
    A candidate record is created by an HR user and can later be linked to multiple interviews.
    """

    name: str
    email: EmailStr
    phone: str
    experience: int
    resume_path: str
    status: CandidateStatus

    # Stores the user_id of the HR/Admin who created the candidate profile.
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)