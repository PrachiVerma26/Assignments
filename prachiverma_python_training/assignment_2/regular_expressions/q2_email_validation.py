"""
Program 2: Validate an email address using regular expressions.
"""

import re

def is_valid_email(email: str) -> bool:
    """Check whether the given email address follows a valid format.
    The validation is performed using a regular expression pattern that verifies the structure of an email address."""

    # Matches a valid email structure: test@gmail.com
    pattern = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"

    # fullmatch() returns a match only if the entire string satisfies the pattern from start to end.
    return bool(re.fullmatch(pattern, email))


if __name__ == "__main__":
    email = input("Enter an email address: ")
    if is_valid_email(email):
        print(f"'{email}' is a valid email address.")
    else:
        print(f"'{email}' is not a valid email address.")