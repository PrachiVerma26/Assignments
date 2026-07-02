from enum import Enum

class CandidateStatus(str, Enum):
    PROFILE_CREATED = "PROFILE_CREATED"
    APPLIED = "APPLIED"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"
    HIRED = "HIRED"