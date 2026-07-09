from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from src.enums.candidate_status import CandidateStatus

class Candidate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    current_company: str
    total_experience: str
    applied_job_id: str
    status: CandidateStatus = CandidateStatus.PROFILE_CREATED       # default status set to profile created
    resume_file_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None