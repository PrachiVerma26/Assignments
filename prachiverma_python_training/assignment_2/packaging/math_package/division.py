"""
Division-related utilities.
"""


def divide(first_number: int, second_number: int) -> float:
    """
    Returns the quotient of two numbers.
    Raises:
        ValueError: If the divisor is zero.
    """

    # Prevent division by zero
    if second_number == 0:
        raise ValueError(
            "Division by zero is not allowed."
        )

    return first_number / second_number