""" program to check whether the number is even or odd """

def check_even_odd(num):
    if num % 2 == 0:
        return "Even"
    return "Odd"

number = int(input("Enter a number: "))
print(f"The number {number} is {check_even_odd(number)}.")