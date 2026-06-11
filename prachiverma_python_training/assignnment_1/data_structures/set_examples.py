"""
1. perform union, intersection, and difference on two sets.
2. remove duplicates from a list using a set.
"""

def set_operations():
    print("1. Set Operations ->")

    set1 = {4,8,12,16,20}
    set2 = {8,16,24,32,40}

    print(f"Set 1: {set1}")
    print(f"Set 2: {set2}")

    print(f"Union: {set1.union(set2)}")
    print(f"Intersection: {set1.intersection(set2)}")
    print(f"Difference (Set1 - Set2): {set1.difference(set2)}")


def remove_duplicates():
    print("\n2. Remove Duplicates from List ->")
    numbers = [16, 25, 36, 25, 44, 16, 5]

    # converting the list to a set automatically removes duplicates.
    unique_numbers = list(set(numbers))

    print(f"Original List: {numbers}")
    print(f"List Without Duplicates: {unique_numbers}")


if __name__ == "__main__":
    set_operations()
    remove_duplicates()