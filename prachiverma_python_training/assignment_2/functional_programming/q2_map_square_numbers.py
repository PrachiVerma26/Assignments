"""
Program 2: Use map() to convert a list of numbers into their squares.
"""

def calculate_squares(numbers: list[int]) -> list[int]:
    """Convert each number in the list to its square."""

    return list(map(lambda number: number ** 2, numbers))


if __name__ == "__main__":
    numbers = [6,7,8,9,10]

    squared_numbers = calculate_squares(numbers)

    print(f"Input numbers: {numbers}")
    print(f"Squares numbers: {squared_numbers}")