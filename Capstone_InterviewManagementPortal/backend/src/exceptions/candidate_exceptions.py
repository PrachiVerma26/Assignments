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