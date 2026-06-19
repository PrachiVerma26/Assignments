"""
Program 3: Create and use a package with two modules.
"""

from user_package import (get_username,get_email)


if __name__ == "__main__":
    print(f"Username: {get_username()}")
    print(f"Email Address: {get_email()}")