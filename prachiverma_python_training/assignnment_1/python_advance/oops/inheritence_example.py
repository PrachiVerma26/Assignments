"""
Program to demonstrate inheritance using Clothing and TShirt classes.
"""
class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

class Employee(Person):
    def __init__(self, name: str, age: int, salary: float, designation: str):
        super().__init__(name, age)
        self.salary = salary
        self.designation=designation

    def display_details(self):
        print(f"Name: {self.name}")
        print(f"Age: {self.age}")
        print(f"Salary: {self.salary}")
        print(f"Designation: {self.designation}")


if __name__ == "__main__":
    employee = Employee("Duke", 22, 75000.00,"Manager")
    employee.display_details()