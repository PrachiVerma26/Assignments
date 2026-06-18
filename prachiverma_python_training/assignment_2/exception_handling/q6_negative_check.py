"""
Program 6: Program that raises a ValueError if a number is negative.
"""

def validate_number(number: int) -> None:

    # Validate that the entered number is non-negative
    if number < 0:
        raise ValueError("Negative numbers are not allowed.")

try:
    number = int(input("Enter a number: "))
    validate_number(number)
    print("Valid number entered.")

# Display the validation error message
except ValueError as error:
    print(error)