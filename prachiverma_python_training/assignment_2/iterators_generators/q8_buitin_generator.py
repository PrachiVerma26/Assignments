"""
Program 8: Iterate over a built-in lazy iterable.

This program demonstrates the use of Python's built-in range() object, 
which generates values on demand rather than storing them all in memory at once.
"""

def iterate_range() -> None:

    """
    Iterate through values produced by range().
    """
    
    numbers = range(1, 6)
    for number in numbers:
        print(number)


if __name__ == "__main__":
    iterate_range()