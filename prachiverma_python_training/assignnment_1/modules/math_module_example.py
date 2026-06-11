""" program to demonstrate the use of the math module. """

import math
def math_module_example(number):

    square_root = math.sqrt(number)   # to find the square root of a number using the math.sqrt() function
    power = math.pow(5, 3)            # to find the value of 5 raised to the power 3 using the math.pow() function
    factorial = math.factorial(5)     # to find the factorial of 5 using the math.factorial() function

    print(f"Square Root of {number}: {square_root}")
    print(f"5 raised to the power 3: {power}")
    print(f"Factorial of 5: {factorial}")

if __name__ == "__main__":
    number=int(input("Enter a number:"))
    math_module_example(number)