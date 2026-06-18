"""
Program 1: Create an iterator for a list and print elements using next().
"""

def iterate_products() -> None:
    """
    Creates an iterator from a product list and retrieves elements one at a time using next().
    """

    products = ["Laptop", "Mouse", "Keyboard"]

    product_iterator = iter(products)

    try:
        while True:
            print(next(product_iterator))

    except StopIteration:
        print("All products have been processed.")


if __name__ == "__main__":
    iterate_products()