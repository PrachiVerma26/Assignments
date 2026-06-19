"""
Program 3: Create a function with a logical bug and use pdb to identify the issue.
"""

import pdb

def calculate_average(numbers: list[int]) -> float:
    """Calculate the average of the given numbers."""

    # Pause execution before calculating the average.
    pdb.set_trace()

    # Logical bug:The average should be calculated using len(numbers), but len(numbers) - 1 is used here intentionally.
    return sum(numbers) / (len(numbers) - 1)

if __name__ == "__main__":
    values = [10, 20, 30, 40]
    average = calculate_average(values)
    print(f"Calculated average: {average}")