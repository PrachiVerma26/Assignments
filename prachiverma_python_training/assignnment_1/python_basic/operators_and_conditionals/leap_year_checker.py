""" Program to cehck whether the given year is leap year or not """

def check_leap_year(year):
    if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
        print(f"{year} is a leap year.")
    else:
        print(f"{year} is not a leap year.")

year=int(input("Enter a year: "))
check_leap_year(year)