"""
Program 3: Use filter to extract even numbers from a list.
"""

def get_even_numbers(numbers: list[int]) -> list[int]:
    """ Returns all even numbers extracted from the given list using filter() function."""

    return list(filter(lambda number: number %2 == 0, numbers))


if __name__ == "__main__":
    numbers = [6,7,8,9,10]

    even_numbers = get_even_numbers(numbers)

    print(f"Numbers: {numbers}")
    print(f"Filtered even numbers: {even_numbers}")