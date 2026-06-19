"""
Program 5: Extract all words starting with a capital letter.
"""

import re

def extract_capitalized_words(text: str) -> list[str]:

    # findall() returns all words that match the pattern and the pattern matches words that start with an uppercase letter.
    return re.findall(r"\b[A-Z][a-zA-Z]*\b",text)


if __name__ == "__main__":
    sentence = ("Rahul and Priya attended a conference in Mumbai on Monday.")

    capitalized_words = extract_capitalized_words(sentence)

    print(f"Input text: {sentence}")
    print(f"Capitalized words found: "f"{capitalized_words}")