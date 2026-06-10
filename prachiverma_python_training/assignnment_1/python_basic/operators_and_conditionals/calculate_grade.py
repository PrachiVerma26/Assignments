"""program to calculate grade based on marks """

def calculate_grade(marks):

    # Validate marks
    if not 0 <= marks <= 100:
        return "Invalid Marks"

    if marks >= 75:
        return "A"
    elif marks >= 60:
        return "B"
    elif marks >= 40:
        return "C"
    return "Fail"


marks = 78
print(f"Grade: {calculate_grade(marks)}")