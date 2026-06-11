""" program to demonstrate polymorphism using different clothing classes """

class TShirt:
    def get_discount(self):
        print("T-Shirt Discount: 10%")

class Jeans:
    def get_discount(self):
        print("Jeans Discount: 15%")

if __name__ == "__main__":
    products = [TShirt(), Jeans()]

    # calling the same method on different product objects
    for product in products:
        product.get_discount()