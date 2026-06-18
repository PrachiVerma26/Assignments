"""
Program 4: Generator that produces Fibonacci numbers.
"""

def fibonacci_generator(count: int):
    """
    Generates the specified number of Fibonacci values

    Args:
        count (int): Number of Fibonacci values to generate
    """

    # No values to generate for non-positive counts
    if count <= 0:
        return

    # Initialize the first two Fibonacci numbers
    first, second = 0, 1

    for _ in range(count):
        # Yield the current Fibonacci number and pause execution.
        # The function resumes from this point when the next value is requested.
        yield first

        # Update the sequence
        first, second = second, first + second


if __name__ == "__main__":
    for number in fibonacci_generator(10):
        print(number)