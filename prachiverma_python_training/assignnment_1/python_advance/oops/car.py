""" program to create a Car class using a constructor """

class Car:
    def __init__(self, brand: str, model: str, year: int):

        # initializing car attributes using the constructor.
        self.brand = brand
        self.model = model
        self.year = year

    def display_details(self):
        print(f"Brand: {self.brand}")
        print(f"Model: {self.model}")
        print(f"Year : {self.year}")


if __name__ == "__main__":
    car = Car("Porsche", "Taycan", 2026)
    car.display_details()