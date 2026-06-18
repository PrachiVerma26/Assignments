"""
Program 6: Iterator vs Generator Example

This program demonstrates two ways of iterating through employee IDs:
1. Using a custom iterator class.
2. Using a generator function.

Note:
A detailed explanation of the differences between iterators 
and generators is provided in the accompanying PDF.
"""

class EmployeeIterator:
    """
    Custom iterator that returns employee IDs one at a time
    """

    def __init__(self, employee_ids: list[str]):
        self.employee_ids = employee_ids
        self.current_index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.current_index >= len(self.employee_ids):
            raise StopIteration

        employee_id = self.employee_ids[self.current_index]
        self.current_index += 1

        return employee_id


def employee_generator(employee_ids: list[str]):
    """
    Generator that yields employee IDs one at a time.
    """

    for employee_id in employee_ids:
        # Yield an employee ID and pause execution.
        # The function resumes here when the next value is requested.
        yield employee_id


if __name__ == "__main__":
    employee_ids = [
        "E101",
        "E102",
        "E103",
        "E104",
    ]

    print("Using Iterator:")
    iterator = EmployeeIterator(employee_ids)

    for employee_id in iterator:
        print(employee_id)

    print("\nUsing Generator:")
    generator = employee_generator(employee_ids)

    for employee_id in generator:
        print(employee_id)