"""Password utility functions(using Base64 Encoding). """

import base64
import re
import secrets
import string
from src.exceptions.auth_exceptions import (PasswordValidationException)

def encode_password(password: str) -> str:
    """ Encode plain password using Base64."""
    return base64.b64encode(password.encode("utf-8")).decode("utf-8")

def verify_password(plain_password: str, stored_password: str) -> bool:
    """ Verify user password. """
    return (encode_password(plain_password)== stored_password)

def generate_random_password(length: int = 8) -> str:
    lower = string.ascii_lowercase
    upper = string.ascii_uppercase
    digits = string.digits
    specials = "@$!%*?&"

    password_chars = [secrets.choice(lower), secrets.choice(upper), secrets.choice(digits), secrets.choice(specials)]
    all_chars = lower + upper + digits + specials
    password_chars.extend(secrets.choice(all_chars) for _ in range(max(0, length - 4)))
    for i in range(len(password_chars) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        password_chars[i], password_chars[j] = password_chars[j], password_chars[i]
    return "".join(password_chars)

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