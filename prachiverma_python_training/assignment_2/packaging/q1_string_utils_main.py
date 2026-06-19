"""
Import and use utility functions from a module.
"""

from q1_string_utils import (count_characters,convert_to_uppercase)


text = "Learning packaging in python"

print(f"Character Count: {count_characters(text)}")
print(f"Uppercase text: {convert_to_uppercase(text)}")