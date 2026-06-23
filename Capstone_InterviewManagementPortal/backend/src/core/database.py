from pymongo import MongoClient
from src.core.config import settings
from src.utils.logger import app_logger  # Use centralized logger
from pymongo.errors import PyMongoError

class Database:
    """
    Database connection manager: Responsible for creating and providing a single MongoDB
    database instance throughout the application.
    """
    
    client = None
    db = None

    @classmethod
    def connect(cls):
        try:
            app_logger.info("Connecting to MongoDB...")
            cls.client = MongoClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=5000
            )

            # Verify database connectivity
            cls.client.admin.command("ping")
            cls.db = cls.client[settings.DATABASE_NAME]
            app_logger.info("MongoDB connection established.")
            return cls.db

        except PyMongoError as ex:
            app_logger.error(f"MongoDB connection failed: {ex}")
            raise

    @classmethod
    def get_database(cls):
        if cls.db is None:
            cls.connect()
        return cls.db

db = Database.get_database()
