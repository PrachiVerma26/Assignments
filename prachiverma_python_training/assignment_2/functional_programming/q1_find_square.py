"""
Program 1: Write a lambda function to find the square of a number.
"""

from typing import Callable


def get_square_function() -> Callable[[int], int]:
    """
    Return a lambda function that calculates the square of a number.
    Callable[[int], int] indicates that this function returns another function which accepts an integer and returns an integer.
    """

    return lambda number: number ** 2


if __name__ == "__main__":
    square = get_square_function()

    number = int(input("Enter a number: "))
    print(f"Square of {number} is {square(number)}")