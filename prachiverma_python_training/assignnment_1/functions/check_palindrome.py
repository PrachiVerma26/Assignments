""" program to check the number is palindrome or not """

def check_palindrome(num: int) -> bool:

    # Negative numbers are not palindromes
    if num < 0:
        return False
    
    original_num = num
    reversed_num = 0

    while num > 0:
        digit = num % 10
        reversed_num = (reversed_num * 10) + digit
        num //= 10

    return original_num == reversed_num

# main function to take input and check palindrome
if __name__ == "__main__":
    number = int(input("Enter a number: "))
    if check_palindrome(number):
        print(f"{number} is a palindrome.")
    else:
        print(f"{number} is not a palindrome.")