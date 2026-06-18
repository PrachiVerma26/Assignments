"""
Program 3: A generator function that yields square numbers up to N.
"""

def square_numbers(limit: int):
    """
    Generates square numbers from 1 to N.
    """

    # No values to generate for non-positive limits.
    if limit < 1:
        return

    for number in range(1, limit + 1):

        # Yield(returns one value at a time) the square of the current number and pause execution.
        yield number ** 2


if __name__ == "__main__":
    for square in square_numbers(6):
        print(square)