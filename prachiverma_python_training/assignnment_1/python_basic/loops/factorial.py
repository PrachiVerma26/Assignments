""" Program to calculate the factorial of a number. """

number = int(input("Enter a number: "))
factorial = 1

# Multiplying all numbers from 1 up to the given number.
for current_number in range(1, number + 1):
    factorial *= current_number

print(f"Factorial of {number}: {factorial}")