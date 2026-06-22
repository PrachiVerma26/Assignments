from dotenv import load_dotenv
import os

# Load environment variables from the .env file into the application environment.
load_dotenv()

# MongoDB connection settings retrieved from environment variables
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")