"""
Program 1: Write pytest test cases for a function that adds two numbers.
"""

import pytest

def add_numbers(first_number: int,second_number: int) -> int:
    """Return the sum of two numbers."""
    return first_number + second_number


@pytest.mark.parametrize(
         # Runs the same test with multiple input and expected output combinations
        "first_number, second_number, expected_sum",
    [
        (10, 20, 30),
        (-5, 5, 0),
        (0, 0, 0),
        (-10, -20, -30),
    ]
)
def test_add_numbers(first_number: int,second_number: int,expected_sum: int) -> None:
    """Verify that add_numbers() returns the expected sum for different input combinations."""

    # Verify that the actual result matches the expected sum
    assert (add_numbers(first_number,second_number)== expected_sum)