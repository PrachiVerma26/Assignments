from pydantic_settings import (BaseSettings, SettingsConfigDict)

class Settings(BaseSettings):

    """
    Application configuration class: Loads environment variables from the .env file and validates them
    against the declared types. Any missing required variable will raise a validation error during application startup.
    """

    APP_NAME: str
    API_VERSION: str
    DEBUG: bool = False

    MONGO_URI: str
    DATABASE_NAME: str
    ADMIN_NAME: str
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    DEFAULT_USER_PASSWORD: str

    # Pydantic settings configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"               # Ignore any extra variables present in the .env file
    )

# Global settings instance used throughout the application
settings = Settings()