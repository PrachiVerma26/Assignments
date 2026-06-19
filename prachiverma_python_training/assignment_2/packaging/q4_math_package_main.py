"""
Program 4: Use the math_package package.
"""

from math_package import (add, subtract, multiply, divide)

if __name__ == "__main__":
    first_number = 20
    second_number = 0

    print(f"Addition Result: {add(first_number, second_number)}")

    print(f"Subtraction Result: {subtract(first_number, second_number)}")

    print(f"Multiplication Result: {multiply(first_number, second_number)}")

    try:
        print(f"Division Result: {divide(first_number, second_number)}")
    except ValueError as error:
        # Handle division-related errors
        print(f"Error: {error}")