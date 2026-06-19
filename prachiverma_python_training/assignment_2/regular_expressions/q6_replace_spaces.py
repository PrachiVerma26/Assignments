"""
Program 6: Replace multiple spaces with a single space.
"""

import re

def replace_spaces(text: str) -> str:

    # re.sub() replaces all occurrences of the pattern with the specified replacement string.
    return re.sub(r"\s+", " ", text).strip()

if __name__ == "__main__":
    sentence = ("The     project      review     meeting     is     scheduled     tomorrow.")
    formatted_text = replace_spaces(sentence)
    print(f"Original text: {sentence}")
    print(f"Text after replacing spaces: {formatted_text}")