class CandidateNotFoundException(Exception):
    """Raised when candidate does not exist."""
    pass

class CandidateEmailAlreadyExistsException(Exception):
    """Raised when candidate email already exists."""
    pass

class CandidateMobileAlreadyExistsException(Exception):
    """Raised when candidate mobile number already exists."""
    pass

class InvalidNucleusTeqEmailException(Exception):
    """Raised when candidate email is not a valid NucleusTeq email."""
    pass

class AppliedJobNotFoundException(Exception):
    """Raised when applied job does not exist."""
    pass

class ResumeNotFoundException(Exception):
    """Raised when no resume is found for a candidate."""
    pass

class InvalidFileTypeException(Exception):
    """Raised when an uploaded file is not a PDF."""
    pass

class EmptyFileException(Exception):
    """Raised when an uploaded file is empty."""
    pass

class ResumeUploadFailedException(Exception):
    """Raised when GridFS upload fails."""
    pass

class InvalidCandidateStatusException(Exception):
    """Raised when an invalid candidate status is provided."""
    pass