"""Unit tests for job router endpoints."""

import pytest
from fastapi.testclient import TestClient

from src.enums.role_types import UserRole
from src.exceptions.job_exceptions import DuplicateJobTitleException, JobNotFoundException
from src.main import app
from src.schemas.response.job_response import CreateJobResponse, JobDetailResponse, JobListResponse, JobResponse
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
def job_id():
    return "507f1f77bcf86cd799439011"

@pytest.fixture
def job_payload():
    return {
        "title": "Software Engineer",
        "description": "Develop software applications using Python and FastAPI",
        "requirements": "3+ years Python experience and FastAPI knowledge",
        "location": "Remote",
        "employment_type": "Full-time",
        "salary_range": "$80,000 - $120,000",
        "department": "Engineering",
        "experience_level": "Mid-level",
    }

@pytest.fixture
def job_response(job_id, job_payload):
    return JobResponse(id=job_id, **job_payload)


@pytest.fixture
def override_current_user():
    def _override(role=UserRole.HR.value, email="hr@nucleusteq.com"):
        app.dependency_overrides[get_current_user] = lambda: {
            "_id": "user_id",
            "email": email,
            "role": role,
        }
    return _override

def test_create_job_success(client, mocker, override_current_user, job_payload, job_response):
    override_current_user()
    mock_create_job = mocker.patch(
        "src.routers.job_router.job_service.create_new_job",
        return_value=CreateJobResponse(
            message="Job created successfully.",
            job=job_response,
        ),
    )
    response = client.post("/jobs", json=job_payload)
    assert response.status_code == 201
    assert response.json()["message"] == "Job created successfully."
    assert response.json()["job"]["title"] == job_payload["title"]
    mock_create_job.assert_called_once()
    assert mock_create_job.call_args.args[0].title == job_payload["title"]

def test_create_job_rejects_unauthorized_role(client, mocker, override_current_user, job_payload,):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mock_create_job = mocker.patch("src.routers.job_router.job_service.create_new_job")
    response = client.post("/jobs", json=job_payload)
    assert response.status_code == 403
    mock_create_job.assert_not_called()

def test_create_job_duplicate_title(client, mocker, override_current_user, job_payload):
    override_current_user()
    mocker.patch(
        "src.routers.job_router.job_service.create_new_job",
        side_effect=DuplicateJobTitleException("Job title already exists."),
    )
    response = client.post("/jobs", json=job_payload)
    assert response.status_code == 400
    assert response.json()["message"] == "Job title already exists."

def test_create_job_invalid_payload(client, override_current_user):
    override_current_user()
    response = client.post(
        "/jobs",
        json={
            "title": "",
            "description": "Valid description",
        },
    )
    assert response.status_code == 422

def test_get_jobs_success(client, mocker, override_current_user, job_response):
    override_current_user()
    mock_list_jobs = mocker.patch(
        "src.routers.job_router.job_service.list_jobs",
        return_value=JobListResponse(
            message="Jobs retrieved successfully.",
            jobs=[job_response],
            total=1,
            page=1,
            limit=10,
            total_pages=1,
        ),
    )
    response = client.get("/jobs")
    assert response.status_code == 200
    assert response.json()["message"] == "Jobs retrieved successfully."
    assert len(response.json()["jobs"]) == 1
    mock_list_jobs.assert_called_once_with(1, 10, None)

def test_get_jobs_with_pagination_and_search(client, mocker, override_current_user):
    override_current_user()
    mock_list_jobs = mocker.patch(
        "src.routers.job_router.job_service.list_jobs",
        return_value=JobListResponse(
            message="Jobs retrieved successfully.",
            jobs=[],
            total=25,
            page=2,
            limit=5,
            total_pages=5,
        ),
    )
    response = client.get("/jobs?page=2&limit=5&search=engineer")
    assert response.status_code == 200
    assert response.json()["page"] == 2
    assert response.json()["limit"] == 5
    mock_list_jobs.assert_called_once_with(2, 5, "engineer")

def test_get_jobs_rejects_unauthorized_role(client, mocker, override_current_user):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mock_list_jobs = mocker.patch("src.routers.job_router.job_service.list_jobs")
    response = client.get("/jobs")
    assert response.status_code == 403
    mock_list_jobs.assert_not_called()

def test_get_jobs_invalid_pagination_params(client, override_current_user):
    override_current_user()
    response = client.get("/jobs?page=0&limit=0")
    assert response.status_code == 422

def test_get_job_by_id_success(client, mocker, override_current_user, job_id, job_response):
    override_current_user()
    mock_get_job = mocker.patch(
        "src.routers.job_router.job_service.get_job_by_id",
        return_value=JobDetailResponse(
            message="Job retrieved successfully.",
            job=job_response,
        ),
    )
    response = client.get(f"/jobs/{job_id}")
    assert response.status_code == 200
    assert response.json()["job"]["id"] == job_id
    mock_get_job.assert_called_once_with(job_id)

def test_get_job_by_id_not_found(client, mocker, override_current_user, job_id):
    override_current_user()
    mocker.patch("src.routers.job_router.job_service.get_job_by_id",side_effect=JobNotFoundException("Job not found."))
    response = client.get(f"/jobs/{job_id}")
    assert response.status_code == 404
    assert response.json()["message"] == "Job not found."

def test_get_job_by_id_rejects_unauthorized_role(client, mocker, override_current_user, job_id):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mock_get_job = mocker.patch("src.routers.job_router.job_service.get_job_by_id")
    response = client.get(f"/jobs/{job_id}")
    assert response.status_code == 403
    mock_get_job.assert_not_called()

def test_update_job_success(client, mocker, override_current_user, job_id, job_payload):
    override_current_user()
    updated_job = JobResponse(
        id=job_id,
        **{
            **job_payload,
            "title": "Senior Software Engineer",
            "salary_range": "$100,000 - $140,000",
            "experience_level": "Senior",
        },
    )
    mock_update_job = mocker.patch("src.routers.job_router.job_service.update_job", return_value=updated_job)
    response = client.put(
        f"/jobs/{job_id}",
        json={
            "title": "Senior Software Engineer",
            "salary_range": "$100,000 - $140,000",
        },
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Senior Software Engineer"
    assert response.json()["salary_range"] == "$100,000 - $140,000"
    mock_update_job.assert_called_once()
    assert mock_update_job.call_args.args[0] == job_id
    assert mock_update_job.call_args.args[1].title == "Senior Software Engineer"

def test_update_job_not_found(client, mocker, override_current_user, job_id):
    override_current_user()
    mocker.patch("src.routers.job_router.job_service.update_job", side_effect=JobNotFoundException("Job not found."))
    response = client.put(f"/jobs/{job_id}", json={"title": "Updated Title"})
    assert response.status_code == 404
    assert response.json()["message"] == "Job not found."

def test_update_job_duplicate_title(client, mocker, override_current_user, job_id):
    override_current_user()
    mocker.patch("src.routers.job_router.job_service.update_job", side_effect=DuplicateJobTitleException("Job title already exists."))
    response = client.put(f"/jobs/{job_id}", json={"title": "Existing Job Title"})
    assert response.status_code == 400
    assert response.json()["message"] == "Job title already exists."

def test_update_job_rejects_unauthorized_role(client, mocker, override_current_user, job_id):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mock_update_job = mocker.patch("src.routers.job_router.job_service.update_job")
    response = client.put(f"/jobs/{job_id}", json={"title": "Updated Title"})
    assert response.status_code == 403
    mock_update_job.assert_not_called()

def test_update_job_invalid_payload(client, override_current_user, job_id):
    override_current_user()
    response = client.put(f"/jobs/{job_id}", json={"title": ""})
    assert response.status_code == 422

def test_update_job_accepts_empty_payload(client, mocker, override_current_user, job_id, job_response):
    override_current_user()
    mock_update_job = mocker.patch(
        "src.routers.job_router.job_service.update_job",
        return_value=job_response,
    )
    response = client.put(f"/jobs/{job_id}", json={})
    assert response.status_code == 200
    mock_update_job.assert_called_once()
    assert mock_update_job.call_args.args[1].model_dump(exclude_none=True) == {}
