"""Authentication related constants."""

from src.enums.role_types import UserRole
from src.enums.collection import Collection

# MongoDB collection names
USER_COLLECTION = Collection.USERS.value
JOB_COLLECTION = Collection.JOBS.value
CANDIDATE_COLLECTION = Collection.CANDIDATES.value
INTERVIEW_COLLECTION = Collection.INTERVIEWS.value

# GridFS bucket name for resume storage
RESUME_BUCKET = "resumes"

# Allowed system roles
ALLOWED_ROLES = [
    UserRole.ADMIN,
    UserRole.HR,
    UserRole.INTERVIEWER
]