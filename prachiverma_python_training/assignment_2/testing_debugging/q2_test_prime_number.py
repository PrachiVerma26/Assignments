"""
Program 2: Write pytest test cases for a function that checks whether a number is prime.
"""

import math
import pytest

def is_prime(number: int) -> bool:

    # Prime numbers are greater than 1.
    if number < 2:
        return False

    # 2 is the only even prime number.
    if number == 2:
        return True

    # Any other even number cannot be prime.
    if number % 2 == 0:
        return False

    # Only check divisors up to the square root of the number.
    max_divisor = math.isqrt(number) + 1

    # Skip even divisors because they were already handled above.
    for divisor in range(3, max_divisor, 2):
        if number % divisor == 0:
            return False

    return True


@pytest.mark.parametrize(
    # Runs the test against multiple prime and non-prime values.
    "number, expected_result",
    [
        (2, True),
        (3, True),
        (13, True),
        (17, True),
        (97, True),
        (4, False),
        (0, False),
        (1, False),
        (-5, False),
    ]
)

def test_is_prime(number: int,expected_result: bool) -> None:
    """ Verify prime number validation for various inputs."""

    # Assert that the function returns the expected result.
    assert is_prime(number) == expected_result