"""
User repository: Contains only MongoDB operations related to user collection.
"""

from src.core.database import db
from src.constants.auth_constants import USER_COLLECTION

def find_user_by_email(email: str):
    return db[USER_COLLECTION].find_one({"email": email.lower()})

def create_user(user_data: dict):
    return db[USER_COLLECTION].insert_one(user_data)

def update_password_by_email(email: str, encoded_password: str):
    return db[USER_COLLECTION].update_one(
        {"email": email.lower()},
        {"$set": {"password": encoded_password}}
    )