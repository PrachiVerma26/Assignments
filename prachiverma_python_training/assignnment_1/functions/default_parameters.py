""" program to demonstrate the use of default parameters. """

def calculate_final_price(price, discount=10): # here price and discount are parameters, and discount has a default value of 10
    return price - (price * discount / 100)

product_price = 1000

print(f"Price with default discount: {calculate_final_price(product_price)}")
print(f"Price with custom discount: {calculate_final_price(product_price, 20)}")