"""Unit tests for the application entry point."""

from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint."""

    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Interview Management Portal Backend Running"}