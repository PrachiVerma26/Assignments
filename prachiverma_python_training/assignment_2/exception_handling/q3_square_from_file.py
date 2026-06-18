"""
Program 3: program to read a number from a file and print its square using try-except-else-finally.
"""

def read_and_square_number() -> None:
    try:
        file = open("assignment_2/exception_handling/number_data.txt", "r")

        # Read the file content, remove extra whitespace, and convert it to an integer
        number = int(file.read().strip())

    except FileNotFoundError:
        # Raised when the specified file does not exist
        print("Error: File not found.")

    except ValueError:
        # Raised when the file content cannot be converted to an integer
        print("Error: File does not contain a valid integer.")

    else:
        # Executes only when no exception occurs
        print(f"Square of {number}: {number ** 2}")

    finally:
        # Executes regardless of success or failure
        try:
            file.close()

        except NameError:
            # Ignores the error if the file was never opened
            pass

        print("File operation completed.")


if __name__ == "__main__":
    read_and_square_number()