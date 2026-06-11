"""
Program to demonstrate inheritance using Clothing and TShirt classes.
"""

class Clothing:
    def __init__(self, brand: str, size: str):
        # initializing common clothing attributes.
        self.brand = brand
        self.size = size

class TShirt(Clothing):
    def __init__(self, brand: str, size: str, color: str):

        # initializing common attributes from the parent class.
        super().__init__(brand, size)
        self.color = color

    def display_details(self):

        # displaying t-shirt details.
        print(f"Brand: {self.brand}")
        print(f"Size: {self.size}")
        print(f"Color: {self.color}")


if __name__ == "__main__":
    tshirt = TShirt("Zara", "M", "BLue")
    tshirt.display_details()