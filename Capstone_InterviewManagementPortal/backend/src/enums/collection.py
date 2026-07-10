from enum import Enum

class Collection(str, Enum):
    USERS = "users"
    JOBS = "jobs"
    CANDIDATES = "candidates"
    INTERVIEWS = "interviews"

