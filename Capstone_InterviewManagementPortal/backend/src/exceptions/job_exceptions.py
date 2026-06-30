"""Custom exceptions for Job Management."""

class JobNotFoundException(Exception):
    """Raised when a job is not found."""
    pass

class DuplicateJobTitleException(Exception):
    """Raised when attempting to create a job with a title that already exists."""
    pass