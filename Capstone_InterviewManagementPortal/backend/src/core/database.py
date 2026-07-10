import logging
from motor.motor_asyncio import AsyncIOMotorClient
from src.core.config import settings
from src.utils.logger import app_logger  # Use centralized logger
from pymongo.errors import PyMongoError
from motor.motor_asyncio import AsyncIOMotorGridFSBucket

logger = logging.getLogger(__name__)

class Database:
    """
    Database connection manager: Responsible for creating and providing a single MongoDB
    database instance throughout the application.
    """
    
    client: AsyncIOMotorClient | None = None
    db = None

    @classmethod
    async def connect(cls):
        try:
            if cls.client is None:
                app_logger.info("Connecting to MongoDB...")
                cls.client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)

            # Verify database connectivity
            await cls.client.admin.command("ping")
            cls.db = cls.client[settings.DATABASE_NAME]
            app_logger.info("MongoDB connection established.")

        except PyMongoError as ex:
            app_logger.error(f"MongoDB connection failed: {ex}")
            raise

    @classmethod
    def get_database(cls):
        if cls.db is None:
            raise RuntimeError("Database has not been initialized. Call Database.connect() during application startup.")
        return cls.db
    
    @classmethod
    def get_resume_bucket(cls):
        return AsyncIOMotorGridFSBucket(
            cls.get_database(),
            bucket_name="RESUME_BUCKET"
        )
    
    @classmethod
    def close(cls):
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            cls.db = None
            app_logger.info("MongoDB connection closed.")
