"""
User repository: Contains only MongoDB operations related to user collection.
"""

from src.core.database import Database
from src.constants.auth_constants import USER_COLLECTION

def get_user_collection():
    return Database.get_database()[USER_COLLECTION]

async def find_user_by_email(email: str):
    return await get_user_collection().find_one({"email": email.lower()})

async def create_user(user_data: dict):
    return await get_user_collection().insert_one(user_data)

async def update_password_by_email(email: str, encoded_password: str):
    return await get_user_collection().update_one(
        {"email": email.lower()},
        {"$set": {"password": encoded_password}}
    )