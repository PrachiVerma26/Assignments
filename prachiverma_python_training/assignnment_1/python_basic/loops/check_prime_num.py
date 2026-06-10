""" Program to check whether a number is prime. """
def is_prime_number(number):
    is_prime = True

    # edge case: numbers less than 2 are not considered prime.
    if number < 2:
        is_prime = False
    else:
        # checking if the number is divisible by any value between 2 and the number itself.

        for divisor in range(2, number):
            if number % divisor == 0:
                is_prime = False
                break

    if is_prime:
        print(f"{number} is a prime number.")
    else:
        print(f"{number} is not a prime number.")

number = int(input("Enter a number: "))
is_prime_number(number)