"""
Program 7: Check whether a string contains only alphabets.
"""

import re

def is_only_alphabets(text: str) -> bool:
    """Validate that the given string contains only alphabetic characters (A-Z and a-z)."""

    # fullmatch() ensures the entire string contains only uppercase or lowercase alphabetic characters.
    return bool(re.fullmatch(r"[A-Za-z]+",text))

if __name__ == "__main__":
    text = input("Enter a string: ")

    if is_only_alphabets(text):
        print(f"'{text}' contains only alphabetic characters.")
    else:
        print(f"'{text}' contains characters other than alphabets.")