"""
Program 6: Write a recursive function to calculate Fibonacci numbers.
"""

def fibonacci(number: int) -> int:
    
    # Fibonacci numbers cannot be negative.
    if number < 0:
        raise ValueError(
            "number cannot be negative."
        )

    # Base cases: F(0) = 0 and F(1) = 1
    if number <= 1:
        return number

    # Recursive case: the sum of two preceeding numbers
    return ( fibonacci(number - 1)+ fibonacci(number - 2))

if __name__ == "__main__":
    try:
        number = int(input("Enter a Fibonacci number: "))
        fibonacci_value = fibonacci(number)
        print(f"Fibonacci value at position " f"{number} is {fibonacci_value}")

    except ValueError as error:
        print(error)