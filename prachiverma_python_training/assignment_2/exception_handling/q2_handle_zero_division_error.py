"""
Program 2: program to divide two numbers and handle ZeroDivisionError.
"""

def divide_numbers() -> None:
    try:
        numerator = float(input("Enter the numerator: "))
        denominator = float(input("Enter the denominator: "))

        result = numerator / denominator
        print(f"Result: {result}")

    except ZeroDivisionError:
        # Raised when the denominator is zero
        print("Error: Division by zero is not allowed.")

    except ValueError:
        # Raised when the input is not numeric
        print("Error: Please enter valid numbers.")


if __name__ == "__main__":
    divide_numbers()