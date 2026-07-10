class InterviewNotFoundException(Exception):
    """Raised when an interview does not exist."""
    pass

class FeedbackAlreadySubmittedException(Exception):
    """Raised when feedback has already been submitted for an interview."""
    pass

class InvalidInterviewerException(Exception):
    """Raised when the assigned interviewer does not exist or has an invalid role."""
    pass

class InvalidInterviewDateException(Exception):
    """Raised when the interview date or time is invalid."""
    pass

class MeetingLinkRequiredException(Exception):
    """Raised when an online interview requires a meeting link."""
    pass

class LocationRequiredException(Exception):
    """Raised when an offline interview requires a location."""
    pass

class FeedbackNotYetAllowedException(Exception):
    """Raised when feedback is submitted before the interview datetime."""
    pass

class InterviewAlreadyCompletedException(Exception):
    """Raised when attempting to reschedule a completed interview."""
    pass