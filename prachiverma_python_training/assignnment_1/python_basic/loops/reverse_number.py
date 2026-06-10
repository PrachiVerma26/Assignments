""" Reverse Number Program. """

number = int(input("Enter a number: "))
reversed_number = 0

# Using a while loop because the process should continue until all digits are processed.
while number > 0:
    digit = number % 10
    reversed_number = reversed_number * 10 + digit
    number //= 10

print(f"Reversed Number: {reversed_number}")