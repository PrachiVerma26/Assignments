""" program to import and use a user-defined module. """

from functions.max_number import find_maximum_number

def custom_module():
    numbers = list(map(int, input("Enter a list of numbers separated by space: ").split()))
    max_number = find_maximum_number(numbers)
    print(f"The maximum number in the list is: {max_number}")

if __name__ == "__main__":
    custom_module()