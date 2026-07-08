import pytest
from datetime import datetime, date, time
from unittest.mock import AsyncMock
from fastapi.testclient import TestClient
from bson import ObjectId
from src.enums.interview_mode import InterviewMode
from src.enums.interview_status import InterviewStatus
from src.enums.recommendation import Recommendation
from src.enums.role_types import UserRole
from src.exceptions import candidate_exceptions, interview_exceptions
from src.main import app
from src.schemas.response.interview_response import (
    CandidateSummaryResponse,
    CreateInterviewResponse,
    FeedbackResponse,
    HRDashboardResponse,
    InterviewDetailResponse,
    InterviewListResponse,
    InterviewResponse,
    InterviewerDashboardResponse,
    InterviewerSummaryResponse,
)
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
def interview_id():
    return "507f1f77bcf86cd799439011"

@pytest.fixture
def interview_payload():
    return {
        "candidate_id": str(ObjectId()),
        "interviewer_id": str(ObjectId()),
        "interview_date": "2099-12-01",
        "interview_time": "10:00:00",
        "interview_mode": "ONLINE",
        "meeting_link": "https://meet.example.com",
        "location": None,
    }

@pytest.fixture
def interview_response(interview_id, interview_payload):
    return InterviewResponse(
        id=interview_id,
        candidate=CandidateSummaryResponse(id=interview_payload["candidate_id"], name="Prachi Verma"),
        interviewer=InterviewerSummaryResponse(id=interview_payload["interviewer_id"], name="Interviewer One"),
        interview_date=date(2099, 12, 1),
        interview_time=time(10, 0),
        interview_mode=InterviewMode.ONLINE,
        meeting_link="https://meet.example.com",
        location=None,
        status=InterviewStatus.SCHEDULED,
        technical_rating=None,
        communication_rating=None,
        created_at=datetime.utcnow(),
    )

@pytest.fixture
def override_current_user():
    def _override(role=UserRole.HR.value, email="hr@nucleusteq.com", user_id=None):
        uid = user_id or str(ObjectId())
        app.dependency_overrides[get_current_user] = lambda: {"_id": uid, "email": email, "role": role}
    return _override

def feedback_payload(**kwargs):
    data = {
        "technical_rating": 4,
        "communication_rating": 5,
        "comments": "Good",
        "recommendation": "SELECT",
    }
    data.update(kwargs)
    return data

def test_schedule_interview_success(client, mocker, override_current_user, interview_payload, interview_response):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.schedule_interview",
        new=AsyncMock(return_value=CreateInterviewResponse(message="Interview scheduled successfully.", interview=interview_response)))
    response = client.post("/interviews", json=interview_payload)
    assert response.status_code == 201
    assert response.json()["message"] == "Interview scheduled successfully."
    assert response.json()["interview"]["candidate"]["name"] == "Prachi Verma"

def test_schedule_interview_rejects_non_hr(client, mocker, override_current_user, interview_payload):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mock_svc = mocker.patch("src.routers.interview_router.interview_service.schedule_interview", new=AsyncMock())
    response = client.post("/interviews", json=interview_payload)
    assert response.status_code == 403
    mock_svc.assert_not_awaited()

def test_schedule_interview_candidate_not_found(client, mocker, override_current_user, interview_payload):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.schedule_interview",
        new=AsyncMock(side_effect=candidate_exceptions.CandidateNotFoundException("Candidate not found.")))
    response = client.post("/interviews", json=interview_payload)
    assert response.status_code == 404
    assert response.json()["message"] == "Candidate not found."

def test_schedule_interview_invalid_interviewer(client, mocker, override_current_user, interview_payload):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.schedule_interview",
        new=AsyncMock(side_effect=interview_exceptions.InvalidInterviewerException("Interviewer not found.")))
    response = client.post("/interviews", json=interview_payload)
    assert response.status_code == 400
    assert response.json()["message"] == "Interviewer not found."

def test_schedule_interview_past_date(client, mocker, override_current_user, interview_payload):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.schedule_interview",
        new=AsyncMock(side_effect=interview_exceptions.InvalidInterviewDateException("Interview date and time cannot be in the past.")))
    response = client.post("/interviews", json=interview_payload)
    assert response.status_code == 400

def test_schedule_interview_missing_meeting_link(client, mocker, override_current_user, interview_payload):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.schedule_interview",
        new=AsyncMock(side_effect=interview_exceptions.MeetingLinkRequiredException("Meeting link is required for online interviews.")))
    response = client.post("/interviews", json=interview_payload)
    assert response.status_code == 400

def test_schedule_interview_missing_location(client, mocker, override_current_user, interview_payload):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.schedule_interview",
        new=AsyncMock(side_effect=interview_exceptions.LocationRequiredException("Location is required for offline interviews.")))
    response = client.post("/interviews", json=interview_payload)
    assert response.status_code == 400

def test_schedule_interview_invalid_payload(client, override_current_user):
    override_current_user()
    response = client.post("/interviews", json={"candidate_id": "only_this"})
    assert response.status_code == 422

def test_get_interviews_success(client, mocker, override_current_user, interview_response):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.get_interviews",
        new=AsyncMock(return_value=InterviewListResponse(message="Interviews retrieved successfully.", interviews=[interview_response], total=1, page=1, limit=10, total_pages=1)))
    response = client.get("/interviews")
    assert response.status_code == 200
    assert response.json()["message"] == "Interviews retrieved successfully."
    assert len(response.json()["interviews"]) == 1

def test_get_interviews_rejects_admin(client, mocker, override_current_user):
    override_current_user(role=UserRole.ADMIN.value)
    mock_svc = mocker.patch("src.routers.interview_router.interview_service.get_interviews", new=AsyncMock())
    response = client.get("/interviews")
    assert response.status_code == 403
    mock_svc.assert_not_awaited()

def test_get_interviews_pagination(client, mocker, override_current_user):
    override_current_user()
    mock_svc = mocker.patch("src.routers.interview_router.interview_service.get_interviews",
        new=AsyncMock(return_value=InterviewListResponse(message="Interviews retrieved successfully.", interviews=[], total=0, page=2, limit=5, total_pages=0)))
    response = client.get("/interviews?page=2&limit=5")
    assert response.status_code == 200
    mock_svc.assert_awaited_once_with(2, 5)

def test_get_interview_by_id_success(client, mocker, override_current_user, interview_id, interview_response):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.get_interview_by_id",
        new=AsyncMock(return_value=InterviewDetailResponse(message="Interview retrieved successfully.", interview=interview_response)))
    response = client.get(f"/interviews/{interview_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Interview retrieved successfully."

def test_get_interview_by_id_not_found(client, mocker, override_current_user, interview_id):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.get_interview_by_id",
        new=AsyncMock(side_effect=interview_exceptions.InterviewNotFoundException("Interview not found.")))
    response = client.get(f"/interviews/{interview_id}")
    assert response.status_code == 404
    assert response.json()["message"] == "Interview not found."

def test_update_interview_success(client, mocker, override_current_user, interview_id, interview_response):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.update_interview", new=AsyncMock(return_value=interview_response))
    response = client.put(f"/interviews/{interview_id}", json={"interview_time": "11:00:00"})
    assert response.status_code == 200

def test_update_interview_not_found(client, mocker, override_current_user, interview_id):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.update_interview",
        new=AsyncMock(side_effect=interview_exceptions.InterviewNotFoundException("Interview not found.")))
    response = client.put(f"/interviews/{interview_id}", json={"interview_time": "11:00:00"})
    assert response.status_code == 404

def test_update_interview_allows_interviewer(client, mocker, override_current_user, interview_id, interview_response):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mock_svc = mocker.patch("src.routers.interview_router.interview_service.update_interview", new=AsyncMock(return_value=interview_response))
    response = client.put(f"/interviews/{interview_id}", json={"interview_time": "11:00:00"})
    assert response.status_code == 200
    mock_svc.assert_awaited_once()

def test_update_interview_rejects_admin(client, mocker, override_current_user, interview_id):
    override_current_user(role=UserRole.ADMIN.value)
    mock_svc = mocker.patch("src.routers.interview_router.interview_service.update_interview", new=AsyncMock())
    response = client.put(f"/interviews/{interview_id}", json={"interview_time": "11:00:00"})
    assert response.status_code == 403
    mock_svc.assert_not_awaited()

def test_submit_feedback_success(client, mocker, override_current_user, interview_id):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mocker.patch("src.routers.interview_router.interview_service.submit_feedback",
        new=AsyncMock(return_value=FeedbackResponse(message="Feedback submitted successfully.", interview_id=interview_id, technical_rating=4, communication_rating=5, comments="Good", recommendation=Recommendation.SELECT)))
    response = client.post(f"/interviews/{interview_id}/feedback", json=feedback_payload())
    assert response.status_code == 201
    assert response.json()["message"] == "Feedback submitted successfully."

def test_submit_feedback_rejects_non_interviewer(client, mocker, override_current_user, interview_id):
    override_current_user(role=UserRole.HR.value)
    mock_svc = mocker.patch("src.routers.interview_router.interview_service.submit_feedback", new=AsyncMock())
    response = client.post(f"/interviews/{interview_id}/feedback", json=feedback_payload())
    assert response.status_code == 403
    mock_svc.assert_not_awaited()

def test_submit_feedback_duplicate(client, mocker, override_current_user, interview_id):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mocker.patch("src.routers.interview_router.interview_service.submit_feedback",
        new=AsyncMock(side_effect=interview_exceptions.FeedbackAlreadySubmittedException("Feedback has already been submitted for this interview.")))
    response = client.post(f"/interviews/{interview_id}/feedback", json=feedback_payload())
    assert response.status_code == 409

def test_submit_feedback_invalid_technical_rating(client, override_current_user, interview_id):
    override_current_user(role=UserRole.INTERVIEWER.value)
    response = client.post(f"/interviews/{interview_id}/feedback", json=feedback_payload(technical_rating=6))
    assert response.status_code == 422

def test_submit_feedback_rating_below_min(client, override_current_user, interview_id):
    override_current_user(role=UserRole.INTERVIEWER.value)
    response = client.post(f"/interviews/{interview_id}/feedback", json=feedback_payload(communication_rating=0))
    assert response.status_code == 422

def test_submit_feedback_interview_not_found(client, mocker, override_current_user, interview_id):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mocker.patch("src.routers.interview_router.interview_service.submit_feedback",
        new=AsyncMock(side_effect=interview_exceptions.InterviewNotFoundException("Interview not found.")))
    response = client.post(f"/interviews/{interview_id}/feedback", json=feedback_payload())
    assert response.status_code == 404

def test_get_feedback_success(client, mocker, override_current_user, interview_id):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.get_feedback",
        new=AsyncMock(return_value=FeedbackResponse(message="Feedback retrieved successfully.", interview_id=interview_id, technical_rating=4, communication_rating=5, comments="Good", recommendation=Recommendation.SELECT)))
    response = client.get(f"/interviews/{interview_id}/feedback")
    assert response.status_code == 200
    assert response.json()["technical_rating"] == 4

def test_get_feedback_not_found(client, mocker, override_current_user, interview_id):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.get_feedback",
        new=AsyncMock(side_effect=interview_exceptions.InterviewNotFoundException("No feedback found for this interview.")))
    response = client.get(f"/interviews/{interview_id}/feedback")
    assert response.status_code == 404

def test_hr_dashboard_success(client, mocker, override_current_user):
    override_current_user()
    mocker.patch("src.routers.interview_router.interview_service.get_hr_dashboard",
        new=AsyncMock(return_value=HRDashboardResponse(total_jobs=5, total_candidates=10, scheduled_interviews=3, selected_candidates=2, rejected_candidates=1)))
    response = client.get("/interviews/dashboard/hr")
    assert response.status_code == 200
    assert response.json()["total_jobs"] == 5
    assert response.json()["total_candidates"] == 10
    assert response.json()["scheduled_interviews"] == 3

def test_hr_dashboard_rejects_non_hr(client, mocker, override_current_user):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mock_svc = mocker.patch("src.routers.interview_router.interview_service.get_hr_dashboard", new=AsyncMock())
    response = client.get("/interviews/dashboard/hr")
    assert response.status_code == 403
    mock_svc.assert_not_awaited()

def test_interviewer_dashboard_success(client, mocker, override_current_user):
    override_current_user(role=UserRole.INTERVIEWER.value)
    mocker.patch("src.routers.interview_router.interview_service.get_interviewer_dashboard",
        new=AsyncMock(return_value=InterviewerDashboardResponse(assigned_interviews=4, pending_feedback=2, completed_feedback=2)))
    response = client.get("/interviews/dashboard/interviewer")
    assert response.status_code == 200
    assert response.json()["assigned_interviews"] == 4
    assert response.json()["pending_feedback"] == 2
    assert response.json()["completed_feedback"] == 2

def test_interviewer_dashboard_rejects_non_interviewer(client, mocker, override_current_user):
    override_current_user(role=UserRole.HR.value)
    mock_svc = mocker.patch("src.routers.interview_router.interview_service.get_interviewer_dashboard", new=AsyncMock())
    response = client.get("/interviews/dashboard/interviewer")
    assert response.status_code == 403
    mock_svc.assert_not_awaited()
