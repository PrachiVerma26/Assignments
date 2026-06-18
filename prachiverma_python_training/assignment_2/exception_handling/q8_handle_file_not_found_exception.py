"""
Program 8: Program to handle FileNotFoundError when trying to open a file.
"""

def load_configuration() -> None:
    """
    Loads application configuration from a file and handles missing file errors gracefully.
    """

    config_file = "config.json"

    try:
        with open(config_file, "r") as file:
            file.read()

        print("Configuration loaded successfully.")

    except FileNotFoundError:
        # Raised when the specified configuration file cannot be found
        print(f"Error: '{config_file}' was not found.")

if __name__ == "__main__":
    load_configuration()