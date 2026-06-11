"""
1. Create a student dictionary and access values.
2. Count frequency of characters in a string using a dictionary.
3. Merge two dictionaries.
"""

def student_details():
    print("1. Student Dictionary ->")

    student = {             # dictionary to store student details
        "name": "Ram Verma",
        "age": 21,
        "course": "B.Tech"
    }

    print(f"Student Name: {student['name']}")
    print(f"Student Age: {student['age']}")
    print(f"Student Course: {student['course']}")


def count_character_frequency():
    print("\n2. Character Frequency ->")

    text = "Computational"

    # dictionary to store character frequency
    frequency = {}

    # counting occurrences of each character.
    for character in text:
        frequency[character] = frequency.get(character, 0) + 1

    print(f"String: {text}")
    print(f"Character Frequency: {frequency}")


def merge_dictionaries():
    print("\n3. Merge Dictionaries ->")

    student_details = {
        "name": "Sita Sharma",
        "age": 21
    }

    academic_details = {
        "course": "B.tech",
        "year": 4
    }

    # combining the key-value pairs from both dictionaries.
    merged_dictionary = {**student_details, **academic_details}
    print(f"Merged Dictionary: {merged_dictionary}")


if __name__ == "__main__":
    student_details()
    count_character_frequency()
    merge_dictionaries()