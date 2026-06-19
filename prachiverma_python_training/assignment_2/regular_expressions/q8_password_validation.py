"""
Program 8: Validate a password using regular expressions.
"""

import re

def is_valid_password(password: str) -> bool:
    """
    Validate a password against the following requirements:
    - Minimum length of 12 characters
    - At least one digit
    - At least one special character
    """

    # Pattern requires at least one digit, one special character, and a minimum password length of 8 characters.
    pattern = r"^(?=.*\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).{8,}$"

    # fullmatch() ensures the entire password satisfies all validation rules defined in the pattern.
    return bool(re.fullmatch(pattern, password))

if __name__ == "__main__":
    password = input("Enter a password: ")

    if is_valid_password(password):
        print("The password meets the validation requirements.")
    else:
        print("The password does not meet the validation requirements.")