"""
Admin Seeder: Create a default administrator account during application startup if it does not already exist.
              Called once during FastAPI startup.
"""

from src.core.config import settings
from src.enums.role_types import UserRole
from src.enums.user_status import UserStatus
from src.models.user import User
from src.repositories.user_repository import (find_user_by_email,create_user)
from src.utils.password_utils import encode_password
from src.utils.logger import app_logger

def seed_admin() -> None:
    """Seed default administrator account."""

    admin_email = settings.ADMIN_EMAIL.strip().lower()
    existing_admin = find_user_by_email(admin_email)

    if existing_admin:
        app_logger.info("Default admin already exists.")
        return

    admin_user = User(
        name=settings.ADMIN_NAME,
        email=admin_email,
        password=encode_password(settings.ADMIN_PASSWORD),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE
    )

    create_user(admin_user.model_dump())
    app_logger.info("Default admin created successfully.")