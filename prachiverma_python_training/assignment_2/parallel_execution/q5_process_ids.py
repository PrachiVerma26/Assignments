"""
Program 5: Create two processes and print their process IDs.
"""

import multiprocessing
import os

def display_process_info() -> None:
    """Prints the current process ID."""

    print( f"Process ID: {os.getpid()}")

if __name__ == "__main__":
    process_one = multiprocessing.Process(target=display_process_info)
    process_two = multiprocessing.Process(target=display_process_info)

    process_one.start()
    process_two.start()

    # Wait for both processes to complete
    process_one.join()
    process_two.join()