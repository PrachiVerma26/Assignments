
"""
Program 7: Process a large dataset using a generator.

This program demonstrates how a generator can be used to
process a large dataset without storing all values in memory at once.
"""


def large_dataset_generator(limit: int):
    """
    Generate values one at a time.

    Args:
        limit (int): Number of values to generate.

    Yields: int(Next value in the dataset).
    """

    for value in range(1, limit + 1):
        # Yield one value at a time instead of creating a large list in memory.
        yield value


if __name__ == "__main__":
    total = 0

    # Process a large dataset using a generator
    for value in large_dataset_generator(1_000_000):
        total += value

    print(f"Total: {total}")