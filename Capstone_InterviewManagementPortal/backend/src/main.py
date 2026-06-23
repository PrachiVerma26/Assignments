from fastapi import FastAPI
from src.core.database import db
from pymongo.errors import PyMongoError
from fastapi import HTTPException

# Initialize the Interview Management Portal API
app = FastAPI(title="Interview Management Portal API")

@app.get("/", tags= ["Health Check"])
def home():

    """ Health check endpoint: Used to confirm that the application is running and accessible."""
    return {"message": "Interview Management Portal Backend Running"}

@app.get("/health")
def health_check():

    """
    Verifies database connectivity by issuing a MongoDB ping command.
    Returns:- dict(Current API and database health status).
    """
    try:
        db.command("ping")
        return {
            "status": "UP",
            "database": "CONNECTED"
        }

    except PyMongoError:

        raise HTTPException(status_code=503, detail="Database unavailable")