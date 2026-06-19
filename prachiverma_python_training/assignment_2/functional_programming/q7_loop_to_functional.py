"""
Program 7: Convert a loop-based program into a functional style using filter().
"""

def get_filtered_numbers_loop(numbers: list[int]) -> list[int]:
    """ Return numbers greater than or equal to 20 using a loop. """

    filtered_numbers = []
    for number in numbers:
        if number >= 20:
            filtered_numbers.append(number)

    return filtered_numbers

def get_filtered_numbers_filter(numbers: list[int]) -> list[int]:
    """Return numbers greater than or equal to 20 using filter()."""

    return list(filter(lambda number: number >= 20,numbers))

if __name__ == "__main__":
    numbers = [12, 45, 8, 23, 5, 31, 17]
    loop_result = get_filtered_numbers_loop(numbers)
    filter_result = get_filtered_numbers_filter(numbers)
    print(f"Loop result: {loop_result}")
    print(f"Filter result: {filter_result}")