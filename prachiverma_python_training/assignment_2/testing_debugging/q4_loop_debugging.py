"""
Program 4: Use pdb breakpoints inside a loop and inspect variable values.
"""

import pdb

def calculate_total(numbers: list[int]) -> int:
    """Calculate the sum of all numbers in the list."""
    total = 0

    for number in numbers:

        # Pause execution during each iteration.
        pdb.set_trace()
        total += number

    return total


if __name__ == "__main__":
    numbers = [5, 10, 15]
    total = calculate_total(numbers)
    print(f"Total sum: {total}")