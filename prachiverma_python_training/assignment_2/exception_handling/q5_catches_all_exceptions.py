"""
Program 5: Program that catches all exceptions and prints the error message.
"""

def access_product_data() -> None:
    """
    Retrieves product information using a user-provided key and catches any exception that occurs during execution.
    """

    try:
        product = {
            "name": "Laptop",
            "price": 55000,
            "brand": "Dell"
        }

        key = input("Enter a product detail: ")

        print(f"Value: {product[key]}")

    except Exception as error:
        # Catch any exception and display its error message
        print(f"An error occurred: {error}")


if __name__ == "__main__":
    access_product_data()