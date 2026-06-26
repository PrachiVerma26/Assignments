""" Custom exceptions for User Management."""

class DuplicateEmailException(Exception):
    """ Raised when attempting to create or update a user with an email that already exists."""
    pass

class UserAlreadyInactiveException(Exception):
    """ Raised when attempting to disable an already inactive user."""
    pass

class InvalidObjectIdException(Exception):
    """ Raised when the supplied MongoDB ObjectId is invalid."""
    pass