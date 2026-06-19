"""
Program 4: Use reduce() to find the product of all elements in a list.
"""

from functools import reduce

def calculate_product(numbers: list[int]) -> int:
    
    """
    Calculate the product of all elements in the list using reduce().
    The reduce() function applies the multiplication operation cumulatively across the iterable and returns a single aggregated value."""
    return reduce(lambda first, second: first * second, numbers)

if __name__ == "__main__":
    numbers = [6,7,8,9,10]

    total_product = calculate_product(numbers)

    print(f"Input numbers: {numbers}")
    print(f"Product of all numbers: {total_product}")