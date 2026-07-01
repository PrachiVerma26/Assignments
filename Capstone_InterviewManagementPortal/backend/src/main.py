"""
Application entry point.
Initializes the FastAPI application, executes startup and shutdown tasks,
registers global exception handlers, and includes application routers.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.core.database import Database
from src.exceptions.exception_handler import register_exception_handlers
from src.routers.auth_router import router as auth_router
from src.routers.user_router import router as user_router
from src.routers.job_router import router as job_router
from src.exceptions.exception_handler import (register_exception_handlers)
from fastapi.middleware.cors import CORSMiddleware
from src.seeders.seed_admin import seed_admin
from src.utils.logger import app_logger
from src.schemas.response.success_response import SuccessResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.
    Executes startup tasks before the application starts accepting requests and shutdown tasks before the application stops.
    """

    try:
        app_logger.info("Application startup initiated.")

        # Execute startup tasks
        seed_admin()

        app_logger.info("Application startup completed successfully.")

        yield

    finally:
        app_logger.info("Application shutdown initiated.")

        # Execute shutdown tasks
        Database.close()

        app_logger.info("Database connection closed.")
        app_logger.info("Application shutdown completed.")

app = FastAPI(
    title="Interview Management Portal API",
    lifespan=lifespan,
)

# Allowed frontend origins
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register global exception handlers
register_exception_handlers(app)

# Register application routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(job_router)

@app.get("/", tags=["Health Check"], response_model=SuccessResponse)
def home():
    """
    Health check endpoint.
    Returns:- SuccessResponse: Confirms that the application is running.
    """

    app_logger.info("Health check endpoint accessed.")

    return SuccessResponse(message="Interview Management Portal Backend Running")