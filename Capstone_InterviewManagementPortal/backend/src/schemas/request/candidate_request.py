from pydantic import BaseModel, EmailStr

class CreateCandidateRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile: str
    current_company: str
    total_experience: float
    applied_job_id: str

class UpdateCandidateRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    mobile: str | None = None
    current_company: str | None = None
    total_experience: float | None = None
    applied_job_id: str | None = None