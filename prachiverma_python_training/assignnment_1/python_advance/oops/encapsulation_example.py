""" program to demonstrate encapsulation using a Product class """

class Product:

    def __init__(self, name: str, stock_quantity: int):
        self.name = name
        self.__stock_quantity = stock_quantity

    def add_stock(self, quantity: int):
        self.__stock_quantity += quantity

    def get_stock(self):
        return self.__stock_quantity


if __name__ == "__main__":
    tshirt = Product("Dresses", 50)
    tshirt.add_stock(20)

    print(f"Available Stock: {tshirt.get_stock()}")