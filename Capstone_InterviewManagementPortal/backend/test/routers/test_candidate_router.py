"""Unit tests for candidate router endpoints."""

import pytest
from datetime import datetime, UTC
from unittest.mock import AsyncMock
from fastapi.testclient import TestClient
from src.enums.role_types import UserRole
from src.exceptions.candidate_exceptions import CandidateEmailAlreadyExistsException, CandidateMobileAlreadyExistsException, CandidateNotFoundException, InvalidNucleusTeqEmailException
from src.main import app
from src.schemas.response.candidate_response import CandidateListResponse, CandidateResponse, CreateCandidateResponse
from src.utils.security import get_current_user

@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def candidate_id():
    return "507f1f77bcf86cd799439011"

@pytest.fixture
def candidate_payload():
    return {
        "first_name": "Prachi",
        "last_name": "Verma",
        "email": "prachi.verma@nucleusteq.com",
        "mobile": "9876543210",
        "current_company": "NucleusTeq",
        "total_experience": 3.0,
        "id": "507f1f77bcf86cd799439011",
        "applied_job_id": "507f1f77bcf86cd799439022",
    }

@pytest.fixture
def candidate_response(candidate_payload):
    return CandidateResponse(**candidate_payload, status="PROFILE_CREATED", created_at=datetime.now(UTC))

@pytest.fixture
def override_current_user():
    def _override(role=UserRole.HR.value, email="hr@nucleusteq.com"):
        app.dependency_overrides[get_current_user] = lambda: {"_id": "user_id", "email": email, "role": role}
    return _override

def test_create_candidate_success(client, mocker, override_current_user, candidate_payload, candidate_response):
    """Create a candidate and return 201 with the created candidate."""
    override_current_user()
    mock_create = mocker.patch("src.routers.candidate_router.candidate_service.create_candidate",
        new=AsyncMock(return_value=CreateCandidateResponse(message="Candidate created successfully.", candidate=candidate_response)))
    response = client.post("/candidates", json=candidate_payload)
    assert response.status_code == 201
    assert response.json()["message"] == "Candidate created successfully."
    assert response.json()["candidate"]["email"] == candidate_payload["email"]
    mock_create.assert_awaited_once()

def test_create_candidate_rejects_unauthorized_role(client, mocker, override_current_user, candidate_payload):
    """Reject candidate creation for non-HR roles."""
    override_current_user(role=UserRole.INTERVIEWER.value)
    mock_create = mocker.patch("src.routers.candidate_router.candidate_service.create_candidate", new=AsyncMock())
    response = client.post("/candidates", json=candidate_payload)
    assert response.status_code == 403
    mock_create.assert_not_awaited()

def test_create_candidate_duplicate_email(client, mocker, override_current_user, candidate_payload):
    """Return 409 when the candidate email already exists."""
    override_current_user()
    mocker.patch("src.routers.candidate_router.candidate_service.create_candidate",
        new=AsyncMock(side_effect=CandidateEmailAlreadyExistsException("Email already exists.")))
    response = client.post("/candidates", json=candidate_payload)
    assert response.status_code == 409
    assert response.json()["message"] == "Email already exists."

def test_create_candidate_duplicate_mobile(client, mocker, override_current_user, candidate_payload):
    """Return 409 when the candidate mobile number already exists."""
    override_current_user()
    mocker.patch("src.routers.candidate_router.candidate_service.create_candidate", new=AsyncMock(side_effect=CandidateMobileAlreadyExistsException("Mobile number already exists.")))
    response = client.post("/candidates", json=candidate_payload)
    assert response.status_code == 409
    assert response.json()["message"] == "Mobile number already exists."

def test_create_candidate_invalid_nucleusteq_email(client, mocker, override_current_user, candidate_payload):
    """Return 400 when the email domain is not @nucleusteq.com."""
    override_current_user()
    mocker.patch("src.routers.candidate_router.candidate_service.create_candidate", new=AsyncMock(side_effect=InvalidNucleusTeqEmailException("Only @nucleusteq.com email addresses are allowed.")))
    response = client.post("/candidates", json=candidate_payload)
    assert response.status_code == 400
    assert response.json()["message"] == "Only @nucleusteq.com email addresses are allowed."

def test_create_candidate_invalid_payload(client, override_current_user):
    """Return 422 when required fields are missing."""
    override_current_user()
    response = client.post("/candidates", json={"first_name": "prachi"})
    assert response.status_code == 422

def test_get_candidates_success(client, mocker, override_current_user, candidate_response):
    """Return paginated candidate list with 200."""
    override_current_user()
    mock_list = mocker.patch("src.routers.candidate_router.candidate_service.get_candidates",
        new=AsyncMock(
            return_value=CandidateListResponse(
                message="Candidates retrieved successfully.",
                candidates=[candidate_response],
                total=1,
                page=1,
                limit=10,
                total_pages=1))
    )
    response = client.get("/candidates")
    assert response.status_code == 200
    assert response.json()["message"] == "Candidates retrieved successfully."
    assert len(response.json()["candidates"]) == 1
    mock_list.assert_awaited_once_with(1, 10, None)

def test_get_candidates_with_pagination_and_search(client, mocker, override_current_user):
    """Forward page, limit, and search parameters to the service."""
    override_current_user()
    mock_list = mocker.patch("src.routers.candidate_router.candidate_service.get_candidates",
        new=AsyncMock(
            return_value=CandidateListResponse(
                message="Candidates retrieved successfully.",
                candidates=[],
                total=25,
                page=2,
                limit=5,
                total_pages=5))
    )
    response = client.get("/candidates?page=2&limit=5&search=prachi")
    assert response.status_code == 200
    assert response.json()["page"] == 2
    assert response.json()["limit"] == 5
    mock_list.assert_awaited_once_with(2, 5, "prachi")

def test_get_candidates_rejects_unauthorized_role(client, mocker, override_current_user):
    """Reject candidate listing for non-HR/INTERVIEWER roles."""
    override_current_user(role=UserRole.ADMIN.value)
    mock_list = mocker.patch("src.routers.candidate_router.candidate_service.get_candidates", new=AsyncMock())
    response = client.get("/candidates")
    assert response.status_code == 403
    mock_list.assert_not_awaited()

def test_get_candidates_invalid_pagination_params(client, override_current_user):
    """Return 422 for out-of-range pagination parameters."""
    override_current_user()
    response = client.get("/candidates?page=0&limit=0")
    assert response.status_code == 422

def test_get_candidate_by_id_success(client, mocker, override_current_user, candidate_id, candidate_response):
    """Return the candidate when the ID exists."""
    override_current_user()
    mock_get = mocker.patch("src.routers.candidate_router.candidate_service.get_candidate_by_id", new=AsyncMock(return_value=candidate_response))
    response = client.get(f"/candidates/{candidate_id}")
    assert response.status_code == 200
    assert response.json()["email"] == candidate_response.email
    mock_get.assert_awaited_once_with(candidate_id)

def test_get_candidate_by_id_not_found(client, mocker, override_current_user, candidate_id):
    """Return 404 when the candidate does not exist."""
    override_current_user()
    mocker.patch("src.routers.candidate_router.candidate_service.get_candidate_by_id", new=AsyncMock(side_effect=CandidateNotFoundException("Candidate not found.")))
    response = client.get(f"/candidates/{candidate_id}")
    assert response.status_code == 404
    assert response.json()["message"] == "Candidate not found."

def test_update_candidate_success(client, mocker, override_current_user, candidate_id, candidate_response):
    """Return the updated candidate with 200."""
    override_current_user()
    mock_update = mocker.patch("src.routers.candidate_router.candidate_service.update_candidate", new=AsyncMock(return_value=candidate_response))
    response = client.put(f"/candidates/{candidate_id}", json={"current_company": "New Corp"})
    assert response.status_code == 200
    mock_update.assert_awaited_once()
    assert mock_update.call_args.args[0] == candidate_id
    assert mock_update.call_args.args[1].current_company == "New Corp"

def test_update_candidate_not_found(client, mocker, override_current_user, candidate_id):
    """Return 404 when the candidate to update does not exist."""
    override_current_user()
    mocker.patch("src.routers.candidate_router.candidate_service.update_candidate", 
                 new=AsyncMock(side_effect=CandidateNotFoundException("Candidate not found.")))
    response = client.put(f"/candidates/{candidate_id}", json={"current_company": "New Corp"})
    assert response.status_code == 404
    assert response.json()["message"] == "Candidate not found."

def test_update_candidate_duplicate_email(client, mocker, override_current_user, candidate_id):
    """Return 409 when the updated email belongs to another candidate."""
    override_current_user()
    mocker.patch("src.routers.candidate_router.candidate_service.update_candidate", 
                 new=AsyncMock(side_effect=CandidateEmailAlreadyExistsException("Email already exists.")))
    response = client.put(f"/candidates/{candidate_id}", json={"email": "other@nucleusteq.com"})
    assert response.status_code == 409
    assert response.json()["message"] == "Email already exists."

def test_update_candidate_duplicate_mobile(client, mocker, override_current_user, candidate_id):
    """Return 409 when the updated mobile belongs to another candidate."""
    override_current_user()
    mocker.patch("src.routers.candidate_router.candidate_service.update_candidate",
        new=AsyncMock(side_effect=CandidateMobileAlreadyExistsException("Mobile number already exists.")))
    response = client.put(f"/candidates/{candidate_id}", json={"mobile": "1111111111"})
    assert response.status_code == 409
    assert response.json()["message"] == "Mobile number already exists."

def test_update_candidate_invalid_nucleusteq_email(client, mocker, override_current_user, candidate_id):
    """Return 400 when the updated email domain is not @nucleusteq.com."""
    override_current_user()
    mocker.patch("src.routers.candidate_router.candidate_service.update_candidate",
        new=AsyncMock(side_effect=InvalidNucleusTeqEmailException("Only @nucleusteq.com email addresses are allowed.")),
    )
    response = client.put(f"/candidates/{candidate_id}", json={"email": "prachi@gmail.com"})
    assert response.status_code == 400
    assert response.json()["message"] == "Only @nucleusteq.com email addresses are allowed."

def test_update_candidate_rejects_unauthorized_role(client, mocker, override_current_user, candidate_id):
    """Reject candidate update for non-HR roles."""
    override_current_user(role=UserRole.INTERVIEWER.value)
    mock_update = mocker.patch("src.routers.candidate_router.candidate_service.update_candidate", new=AsyncMock())
    response = client.put(f"/candidates/{candidate_id}", json={"current_company": "New Corp"})
    assert response.status_code == 403
    mock_update.assert_not_awaited()

def test_update_candidate_accepts_empty_payload(client, mocker, override_current_user, candidate_id, candidate_response):
    """Accept an empty update payload and forward it to the service."""
    override_current_user()
    mock_update = mocker.patch("src.routers.candidate_router.candidate_service.update_candidate",
        new=AsyncMock(return_value=candidate_response))
    response = client.put(f"/candidates/{candidate_id}", json={})
    assert response.status_code == 200
    mock_update.assert_awaited_once()
    assert mock_update.call_args.args[1].model_dump(exclude_none=True) == {}