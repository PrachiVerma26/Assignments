"""
Program 7: Convert a normal function into parallel execution using ThreadPoolExecutor.
"""

from concurrent.futures import ThreadPoolExecutor


def calculate_square(number: int) -> int:
    """Returns the square of a number."""
    return number ** 2


if __name__ == "__main__":
    numbers = [1, 2, 3, 4, 5]

    # Execute square calculations concurrently using a thread pool
    with ThreadPoolExecutor() as executor:
        results = executor.map(
            calculate_square,
            numbers
        )

    print(f"Square Values: {list(results)}")