from fastapi import FastAPI

# Initialize the Interview Management Portal API
app = FastAPI(
    title="Interview Management Portal API"
)

@app.get("/", tags= ["Health Check"])
def home():

    """
    Health check endpoint: Used to confirm that the application is running and accessible.
    """
    
    return {"message": "Interview Management Portal Backend Running"}
