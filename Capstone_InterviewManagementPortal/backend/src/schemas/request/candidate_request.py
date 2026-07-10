from pydantic import BaseModel, EmailStr, Field

class CreateCandidateRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile: str
    current_company: str
    experience_years: int = Field(..., ge=0, le=100)
    experience_months: int = Field(default=0, ge=0, le=11)
    applied_job_id: str

class UpdateCandidateRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    mobile: str | None = None
    current_company: str | None = None
    experience_years: int | None = Field(None, ge=0, le=100)
    experience_months: int | None = Field(None, ge=0, le=11)
    applied_job_id: str | None = None