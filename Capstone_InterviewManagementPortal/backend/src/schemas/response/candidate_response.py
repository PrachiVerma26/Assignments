from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from src.enums.candidate_status import CandidateStatus


class CandidateResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    mobile: str
    current_company: str
    total_experience: float
    applied_job_id: str
    status: CandidateStatus
    resume_file_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class CreateCandidateResponse(BaseModel):
    message: str
    candidate: CandidateResponse

class CandidateListResponse(BaseModel):
    message: str
    candidates: List[CandidateResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class ResumeUploadResponse(BaseModel):
    message: str
    resume_file_id: str

class StatusHistoryEntry(BaseModel):
    previous_status: Optional[str] = None
    new_status: str
    updated_at: datetime
    updated_by: Optional[str] = None

class CandidateStatusUpdateResponse(BaseModel):
    message: str
    candidate_id: str
    status: CandidateStatus

class StatusHistoryResponse(BaseModel):
    candidate_id: str
    status_history: List[StatusHistoryEntry]