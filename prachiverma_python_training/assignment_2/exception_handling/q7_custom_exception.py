"""
Program 7: Program to create and use a custom AgeException.
"""

class AgeException(Exception):
    """Raised when age is less than 18."""
    pass

def validate_age(age: int) -> None:
    # Validate that the user meets the minimum age requirement
    if age < 18:
        raise AgeException("Age must be 18 or above.")

try:
    age = int(input("Enter your age: "))
    validate_age(age)
    print("Age verification successful.")

except AgeException as error:
    # Handle custom age validation errors
    print(error)

except ValueError:
    # Raised when the entered age is not a valid integer
    print("Please enter a valid age.")