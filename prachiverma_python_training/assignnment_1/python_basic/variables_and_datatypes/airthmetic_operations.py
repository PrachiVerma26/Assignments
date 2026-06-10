""" program to perform basic arithmetic operations(add, sub, mul and division). """

def calculate(num1, num2):
    print(f"Addition: {num1} + {num2} = {num1 + num2}")
    print(f"Subtraction: {num1} - {num2} = {num1 - num2}")
    print(f"Multiplication: {num1} * {num2} = {num1 * num2}")
    if num2 != 0:
        print(f"Division: {num1} / {num2} = {num1 / num2}")
    else:
        print("Division by zero is not allowed.")


num1 = float(input("Enter the first number: "))
num2 = float(input("Enter the second number: "))
calculate(num1, num2)
