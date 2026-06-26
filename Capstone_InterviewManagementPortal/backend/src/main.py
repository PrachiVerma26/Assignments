from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.core.database import db
from src.seeders.seed_admin import seed_admin
from src.routers.auth_router import router as auth_router
from src.exceptions.exception_handler import (register_exception_handlers)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.
    Executes startup tasks before the application starts accepting requests and shutdown tasks before the application stops.
    """

    # Startup Tasks
    seed_admin()
    yield

app = FastAPI(
    title="Interview Management Portal API",
    lifespan=lifespan
)

# Register exception handlers
register_exception_handlers(app)

# Register routers
app.include_router(auth_router)

@app.get("/", tags=["Health Check"])
def home():
    """
    Health check endpoint: Used to confirm that the application is running and accessible.
    """
    
    return {
        "message":
        "Interview Management Portal Backend Running"
    }