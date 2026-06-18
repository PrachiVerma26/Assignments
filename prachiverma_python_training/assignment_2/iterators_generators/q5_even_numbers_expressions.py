"""
Program 5: Generator expression for even numbers from 1 to 50.
"""


def generate_even_numbers() -> None:

    """Create a generator expression that produces even numbers on demand instead of storing them all in memory.
    """
    even_numbers = (
        number
        for number in range(1, 51)

        # Filter out odd numbers
        if number % 2 == 0
    )

    # Iterate through the generated values and print them.
    for number in even_numbers:
        print(number)


if __name__ == "__main__":
    generate_even_numbers()