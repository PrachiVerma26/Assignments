""" program to swap two numbers. """

first_num = int(input("Enter the First number: "))
second_num = int(input("Enter the Second number: "))

first_num, second_num = second_num, first_num  # swapping the values
print(f"After swapping: First number: {first_num}, Second number: {second_num}", sep="\n")