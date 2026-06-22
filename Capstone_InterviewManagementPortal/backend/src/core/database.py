from pymongo import MongoClient

from src.core.config import (MONGO_URI, DATABASE_NAME)

# Create a single MongoDB client instance that can be reused across the application. 
client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]