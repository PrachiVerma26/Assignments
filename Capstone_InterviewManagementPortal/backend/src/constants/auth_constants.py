"""Authentication related constants."""

from src.enums.role_types import UserRole

# MongoDB collection names
USER_COLLECTION = "users"
JOB_COLLECTION = "jobs"
CANDIDATE_COLLECTION = "candidates"

# GridFS bucket name for resume storage
RESUME_BUCKET = "resumes"

# Allowed system roles
ALLOWED_ROLES = [
    UserRole.ADMIN,
    UserRole.HR,
    UserRole.INTERVIEWER
]