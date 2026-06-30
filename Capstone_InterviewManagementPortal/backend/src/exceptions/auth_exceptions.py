"""Authentication custom exceptions. """

class UserNotFoundException(Exception):
    """Raised when user does not exist."""
    pass

class InvalidCredentialsException(Exception):
    """Raised when password is incorrect."""
    pass

class InactiveUserException(Exception):
    """Raised when user account is inactive."""
    pass

class InvalidRoleException(Exception):
    """Raised when role is not supported."""
    pass

class PasswordValidationException(Exception):
    """Raised when password does not meet policy requirements."""
    pass