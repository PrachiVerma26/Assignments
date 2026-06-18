"""
Program 4: Program to handle multiple exceptions in a single program.
"""

def access_list_data() -> None:
    """
    Retrieves a value from a list using a user-provided index, performs arithmetic operations on the selected value, 
    and demonstrates handling multiple exception types.
    """

    try:
        numbers = [10, 20, 30, 40, 50]

        index = int(input("Enter a list index: "))
        value = numbers[index]

        divisor = int(input("Enter a divisor: "))
        result = value / divisor

        print(f"Selected Value: {value}")
        print(f"Result: {result}")

    except ValueError:
        # Raised when the entered input cannot be converted to an integer
        print("Error: Please enter a valid integer.")

    except IndexError:
        # Raised when the specified list index is out of range
        print("Error: List index is out of range.")

    except ZeroDivisionError:
        # Raised when attempting to divide by zero
        print("Error: Division by zero is not allowed.")


if __name__ == "__main__":
    access_list_data()