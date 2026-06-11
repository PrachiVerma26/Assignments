""" program to check palindrome(Number and string) """

def check_number_palindrome(num: int) -> bool:

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

def check_string_palindrome(text: str) -> bool:
    reversed_text = ""

    # creating the reversed string from the last character
    for index in range(len(text) - 1, -1, -1):
        reversed_text += text[index]

    return text == reversed_text


# main function to take input and check palindrome
if __name__ == "__main__":
    choice = int(input("Check palindrome for number or string (1,2): "))

    if choice == 1:
        number = int(input("Enter a number: "))
        if check_number_palindrome(number):
            print(f"{number} is a palindrome.")
        else:
            print(f"{number} is not a palindrome.")

    elif choice == 2:
        text = input("Enter a string: ")
        if check_string_palindrome(text):
            print(f'"{text}" is a palindrome.')
        else:
            print(f'"{text}" is not a palindrome.')

    else:
        print("Invalid choice! Please try again.")