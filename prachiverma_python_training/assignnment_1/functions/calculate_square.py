""" program to find square of a number """

def calculate_square(num):
    return num ** 2

if __name__ == "__main__":

    # checking if the user input is a valid number and calculating the square
    try:
        number = float(input("Enter a number: "))
        result = calculate_square(number)
        print(f"The square of {number} is {result}.")

    except ValueError:
        print("Please enter a valid number.")