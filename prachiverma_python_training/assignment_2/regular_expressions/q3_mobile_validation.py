"""
Program 3: Validate a 10-digit mobile number.
"""

import re

def is_valid_mobile_number(mobile_number: str) -> bool:

    return bool(re.fullmatch(r"\d{10}", mobile_number))

if __name__ == "__main__":
    mobile_number = input("Enter a mobile number: ")

    if is_valid_mobile_number(mobile_number):
        print(f"'{mobile_number}' is a valid  number.")
    else:
        print(f"'{mobile_number}' is not a valid mobile number.")