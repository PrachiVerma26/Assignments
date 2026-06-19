"""
Program 6: Calculate squares using multiprocessing.
"""

import multiprocessing

def calculate_square(number: int) -> None:
    print(f"Square of {number}:{number ** 2}")

if __name__ == "__main__":
    numbers = [2, 4, 6, 8]

    processes = []

    for number in numbers:

        # Wait for both processes to complete
        process = multiprocessing.Process(
            target=calculate_square,
            args=(number,)
        )

        processes.append(process)
        process.start()

    # Wait for all processes to complete
    for process in processes:
        process.join()