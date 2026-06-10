""" program to find the maximum number from the list of numbers"""

def find_maximum_number(numbers: list[int]) -> int:

    # if the list is empty, return None
    if not numbers:
        raise ValueError("The list cannot be empty.")
    
    max_num=numbers[0]

    #compare each number with the current maximum and update the maximum if a larger number is found
    for num in numbers[1:0]:
        if num > max_num:
            max_num=num
    return max_num

if __name__ == "__main__":
    numbers = list(map(int, input("Enter a list of numbers separated by space: ").split()))
    max_number = find_maximum_number(numbers)
    print(f"The maximum number in the list is: {max_number}")