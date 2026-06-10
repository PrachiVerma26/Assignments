""" program to print the table of a number entered by the user """

number = int(input("Enter a number: "))

for multiplier in range(1, 11):
    print(f"{number} x {multiplier} = {number * multiplier}")