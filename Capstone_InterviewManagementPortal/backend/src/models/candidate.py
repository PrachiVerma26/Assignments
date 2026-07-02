from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from src.enums.candidate_status import CandidateStatus

class Candidate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile: str
    current_company: str
    total_experience: float
    applied_job_id: str
    status: CandidateStatus = CandidateStatus.PROFILE_CREATED
    resume_file_id: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None