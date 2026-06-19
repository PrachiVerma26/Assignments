"""
Program 4: Search for a word in a sentence using re.search().
"""

import re


def contains_word(sentence: str, word: str) -> bool:

    # re.search() looks for the specified word anywhere in the sentence. \b ensures only complete word matches.
    return bool(re.search(rf"\b{re.escape(word)}\b", sentence))

if __name__ == "__main__":
    sentence = "The meeting has been scheduled for next Monday."

    # Target word to search within the sentence
    word = "meeting"

    if contains_word(sentence, word):
        print(f"The word '{word}' was found in the sentence.")
    else:
        print(f"The word '{word}' was not found in the sentence.")