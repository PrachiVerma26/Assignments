""" program to demonstrate encapsulation using a bankclass """

"""
Program to demonstrate encapsulation using a Bank class.
"""

class Bank:

    def __init__(self, balance: float):
        self.__balance = balance

    def deposit(self, amount: float):
        self.__balance += amount

    def get_balance(self):
        return self.__balance
    
    def withdrawal(self, amount: float):
        self.__balance-=amount


if __name__ == "__main__":
    account = Bank(54000)

    account.deposit(1200)
    print(f"Current Balance: {account.get_balance()}")

    account.withdrawal(20000)

    print(f"Current Balance: {account.get_balance()}")