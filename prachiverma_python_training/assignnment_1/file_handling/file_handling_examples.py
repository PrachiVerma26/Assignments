"""
Programs to demonstrate file handling in Python ->
1. create a file and write your name into it.
2. Read a file and count words, lines, and characters.
3. Append data to an existing file.
4. Copy content from one file to another.
5. Search a word in a file.
"""


def write_to_file():

    # here the file is being opened in write mode ("w"), which will create the file if it doesn't exist or overwrite it if it does
    with open("student.txt", "w") as file:
        file.write("Prachi Verma")

    print("Successfully wrote name to the file.")


def read_and_count_file_details():

    # here the file is being opened in read mode ("r") to read its content and perform counting operations
    with open("student.txt", "r") as file:
        content = file.read()

    # counting words by splitting the content based on whitespace and counting the resulting list's length
    word_count = len(content.split())
    character_count = len(content)

    # counting lines by reading all lines into a list and counting the number of elements in that list
    with open("student.txt", "r") as file:
        line_count = len(file.readlines())
    print(f"Word Count: {word_count}")
    print(f"Line Count: {line_count}")
    print(f"Character Count: {character_count}")


def append_data_to_file():

    # here the file is being opened in append mode ("a"), which allows adding new content to the end of the file without overwriting existing data
    with open("student.txt", "a") as file:
        file.write("\nAdding new content to an existing file.")

    print("Data appended successfully.")


def copy_file_content():
    with open("student.txt", "r") as source_file:
        content = source_file.read()

    with open("student_copy.txt", "w") as destination_file:
        destination_file.write(content)

    print("File copied successfully.")


def search_word_in_file(search_word):
    with open("student.txt", "r") as file:
        content = file.read()

    # searching for the given word in the file content
    if search_word in content:
        print(f"'{search_word}' found in file.")
    else:
        print(f"'{search_word}' not found in file.")


if __name__ == "__main__":
    write_to_file()
    append_data_to_file()
    read_and_count_file_details()
    copy_file_content()
    search_word_in_file("content")