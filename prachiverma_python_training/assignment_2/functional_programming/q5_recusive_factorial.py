"""
Program 5:  Write a recursive function to calculate factorial.
"""

def factorial(number: int) -> int:

    # Factorial is only defined for non-negative integers.
    if number < 0:
        raise ValueError(
            "Factorial is not defined for negative numbers."
        )

    # Base case: 0! and 1! are both equal to 1.
    if number in (0, 1):
        return 1

    # Recursive case: n! = n × (n - 1)!
    return number * factorial(number - 1)

if __name__ == "__main__":
    try: 
        number = int(input("Enter a number: "))
        result = factorial(number)
        print(f"Factorial of {number} is {result}")
    except ValueError:
        print("Please enter a valid integer.")