""" program to create a Student class and display student details """

class Student:

    def __init__(self, name: str, age: int, course: str, roll_no: str):
        self.name = name
        self.age = age
        self.course = course
        self.roll_no = roll_no

    def display_details(self):
        print(f"Name: {self.name}")
        print(f"Age: {self.age}")
        print(f"Course: {self.course}")
        print(f"Roll No: {self.roll_no}")


if __name__ == "__main__":
    student = Student("Prachi Verma", 22, "MCA", "IC-2K26-49")
    student.display_details()