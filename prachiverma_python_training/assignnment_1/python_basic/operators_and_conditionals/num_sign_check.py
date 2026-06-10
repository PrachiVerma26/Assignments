""" program to check whether the number is positive, negative or zero """

def check_number_sign(num):

    if num > 0:
        return "Positive."
    elif num < 0:
        return "Negative."
    else:
        return "Zero."

num=int(input("Enter a number: "))
print(f"{num} is {check_number_sign(num)}")