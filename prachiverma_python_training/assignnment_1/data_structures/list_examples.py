""" 
1. program for creating a list of 10 numbers and find sum, max, sort it, and remove duplicates,
2. count even and odd numbers in a list and 
3. reverse a list without using reverse().
"""

def list_operations(numbers: list[int])-> None:
    print("\n 1. List operations ->")
    print(f"Sum of numbers: {sum(numbers)}")
    print(f"Maximum number: {max(numbers)}")
    print(f"Sorted list: {sorted(numbers)}")
    print(f"List without duplicates: {list(set(numbers))}")

def count_even_odd(numbers: list[int])-> None:
    print("\n 2. Count of even and odd numbers ->")
    even_count = odd_count = 0

    #checking each number in the list and counting even and odd numbers
    for num in numbers:
        if num % 2 == 0: 
            even_count += 1
        else: 
            odd_count += 1

    print(f"Count of even numbers: {even_count} and Count of odd numbers: {odd_count}")


def reverse_list(numbers: list[int])-> None:
    print("\n 3. Reversing the list ->")
    reversed_list = []
    for i in range(len(numbers)-1, -1, -1):
        reversed_list.append(numbers[i])
    print(f"Reversed list: {reversed_list}")

if __name__ == "__main__":
    numbers=list(map(int,input("Enter 10 numbers separated by space: ").split()))

    #checking if the user has entered exactly 10 numbers
    if len(numbers) != 10:
        print("Please enter exactly 10 numbers.")
    else:
        list_operations(numbers)
        count_even_odd(numbers)
        reverse_list(numbers)
