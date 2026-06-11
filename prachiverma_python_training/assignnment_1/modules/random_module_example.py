""" program to generate random numbers using the random module. """

import random               # to import the random module
def random_module_example():
    random_num=random.randint(1,10)   # to generate a random integer between 1 and 10
    random_fnum=random.uniform(0,1)   # to generate a random float between 0 and 1

    print(f"Random Integer: {random_num}")
    print(f"Random Float: {random_fnum}")

if __name__ == "__main__":
    random_module_example()