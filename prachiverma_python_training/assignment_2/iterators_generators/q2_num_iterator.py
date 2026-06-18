"""
Program 2: Write a custom iterator class that returns numbers from 1 to N.
"""

class NumberIterator:
    """
    Iterator that yields numbers from 1 to the given limit.
    """

    def __init__(self, max_value: int):
        """
        Initialize the iterator.
        Args: max_value (int): Maximum number to generate.
        """
        self.max_value= max_value
        self.current_value = 1

    def __iter__(self):
        """
        Return the iterator object itself.
        Required for objects that implement the iterator protocol.
        """
        return self

    def __next__(self):
        """
        Return the next number in the sequence.
        Raises: StopIteration(When all numbers have been generated).
        """
        if self.current_value > self.max_value:
            raise StopIteration

        next_number = self.current_value
        self.current_value += 1

        return next_number


if __name__ == "__main__":
    # Iterate through numbers from 1 to 10
    for number in NumberIterator(10):
        print(number)