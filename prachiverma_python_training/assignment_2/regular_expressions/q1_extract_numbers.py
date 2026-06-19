"""
Program 1: Extract all numbers from a string using regular expressions.
"""

import re

def extract_numbers(text: str) -> list[str]:

     # findall() returns all substrings that match the pattern and \d+ matches one or more consecutive digits.
    return re.findall(r"\d+", text)


if __name__ == "__main__":
    sentence =   "My flight is scheduled on 25 June at 9:30 AM."
    extracted_numbers = extract_numbers(sentence)

    print(f"Original text: {sentence}")
    print(f"Extracted numbers: {extracted_numbers}")