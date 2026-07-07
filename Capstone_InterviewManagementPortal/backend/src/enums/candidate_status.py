from enum import Enum

class CandidateStatus(str, Enum):

    APPLIED = "APPLIED"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"
    HIRED = "HIRED"