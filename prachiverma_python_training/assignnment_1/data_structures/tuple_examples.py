"""
1. program to create a tuple and access its elements.
2. convert a tuple into a list and modify it.
"""

def access_tuple_elements():
    print("1. Access Tuple Elements ->")

    cars = ("Toyota", "Ford", "BMW", "Audi")
    for index, car in enumerate(cars):
        print(f"Element {index}: {car}")


def modify_tuple(numbers: tuple) -> None:
    print("\n2. Convert Tuple to List and Modify ->")

    # converting tuple to list because tuples are immutable.
    modified_numbers = list(numbers)
    modified_numbers.append(60)

    print(f"Modified List: {modified_numbers}")


if __name__ == "__main__":

    numbers = (5,10,15,20,25)

    access_tuple_elements()
    modify_tuple(numbers)