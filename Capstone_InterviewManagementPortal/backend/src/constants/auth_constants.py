"""Authentication related constants."""

from src.enums.role_types import UserRole

# MongoDB collection names
USER_COLLECTION = "users"
JOB_COLLECTION = "jobs"

# Allowed system roles
ALLOWED_ROLES = [
    UserRole.ADMIN,
    UserRole.HR,
    UserRole.INTERVIEWER
]