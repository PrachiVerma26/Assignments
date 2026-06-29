"""Database operations for the User collection."""

from bson import ObjectId
from src.constants.auth_constants import USER_COLLECTION
from src.core.database import db


def find_user_by_email(email: str):
    """Find user by email."""
    return db[USER_COLLECTION].find_one({"email": email.lower()})


def create_user(user_data: dict):
    """Create user."""
    return db[USER_COLLECTION].insert_one(user_data)


def find_user_by_id(user_id: str):
    """Find user by id."""
    return db[USER_COLLECTION].find_one({"_id": ObjectId(user_id)})


def find_all_users():
    """Find all users."""
    return list(db[USER_COLLECTION].find({}, {"password": 0},))

def update_user(user_id: str, update_data: dict):
    """Update user."""
    return db[USER_COLLECTION].update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

def update_password_by_email(email: str, encoded_password: str):
    """Update user password by email."""
    return db[USER_COLLECTION].update_one(
        {"email": email.lower()},
        {"$set": {"password": encoded_password, "requires_password_reset": False}},
    )