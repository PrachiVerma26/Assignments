"""Password utility functions(using Base64 Encoding). """

import base64
import re
from src.exceptions.auth_exceptions import (PasswordValidationException)

def encode_password(password: str) -> str:
    """
    Encode plain password using Base64.
    Args:- password (str): User password
    Returns:- str: Encoded password
    """

    return base64.b64encode(password.encode("utf-8")).decode("utf-8")


def verify_password(plain_password: str, stored_password: str) -> bool:
    """
    Verify user password.
    Args:
        plain_password (str): Password entered by user
        stored_password (str): Password stored in database
    Returns: boolean value that is either true or false.
    """

    return (encode_password(plain_password)== stored_password)

def validate_password(password: str) -> bool:
    """
    Validate password strength: 
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """

    password_pattern = (
    r"^(?=.*[a-z])"         # At least one lowercase letter
    r"(?=.*[A-Z])"          # At least one uppercase letter
    r"(?=.*\d)"             # At least one digit
    r"(?=.*[@$!%*?&])"      # At least one special character
    r".{8,50}$"             # Length between 8 and 50 characters
    )

    if not bool(re.match(password_pattern, password)):
        raise PasswordValidationException("Password does not meet policy requirements.")
    
    return True