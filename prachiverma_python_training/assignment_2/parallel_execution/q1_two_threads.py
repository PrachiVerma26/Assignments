"""
Program 1: Create two threads that print numbers from 1 to 5.
"""

import threading

def print_numbers(task_name: str) -> None:
    """Prints numbers from 1 to 5. """

    for number in range(1, 6):
        print(f"{task_name}: {number}")


if __name__ == "__main__":
    first_thread = threading.Thread(target=print_numbers, args=("Task A",))

    second_thread = threading.Thread(target=print_numbers, args=("Task B",))

     # Start both threads for concurrent execution
    first_thread.start()
    second_thread.start()

    # Wait for both threads to finish execution
    first_thread.join()
    second_thread.join()