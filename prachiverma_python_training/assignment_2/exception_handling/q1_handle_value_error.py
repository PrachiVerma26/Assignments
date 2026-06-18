""" 
Program 1: program that takes a number as input and handles ValueError if the input is not a valid integer.
"""

def get_integer() -> int:

    try:
        return int(input("Enter an integer: "))
    
    except ValueError:
        # Raised when the entered value cannot be converted to an integer
        print("Invalid input! Please enter a valid integer.")
        return None


number = get_integer()

# display the number only if a valid integer was entered
if number is not None:
    print(f"The Number entered: {number}")