from datetime import datetime, date, time
import pytest
from unittest.mock import AsyncMock
from bson import ObjectId
from src.services import interview_service
from src.enums.interview_mode import InterviewMode
from src.enums.interview_status import InterviewStatus
from src.enums.recommendation import Recommendation
from src.enums.role_types import UserRole
from src.exceptions import candidate_exceptions, interview_exceptions

@pytest.fixture(autouse=True)
def mock_logger(mocker):
    mocker.patch("src.services.interview_service.app_logger")

def candidate_doc(candidate_id=None):
    return {
        "_id": ObjectId(candidate_id) if candidate_id else ObjectId(),
        "first_name": "Prachi",
        "last_name": "Verma",
    }

def interviewer_doc(interviewer_id=None, role=UserRole.INTERVIEWER.value):
    return {
        "_id": ObjectId(interviewer_id) if interviewer_id else ObjectId(),
        "name": "Interviewer One",
        "email": "interviewer@nucleusteq.com",
        "role": role,
    }

def interview_doc(interview_id=None, candidate_id=None, interviewer_id=None, technical_rating=None, communication_rating=None, status=InterviewStatus.SCHEDULED.value):
    return {
        "_id": ObjectId(interview_id) if interview_id else ObjectId(),
        "candidate_id": candidate_id or str(ObjectId()),
        "interviewer_id": interviewer_id or str(ObjectId()),
        "interview_datetime": datetime(2099, 12, 1, 10, 0),
        "interview_mode": InterviewMode.ONLINE.value,
        "meeting_link": "https://meet.example.com",
        "location": None,
        "status": status,
        "technical_rating": technical_rating,
        "communication_rating": communication_rating,
        "comments": "Good" if technical_rating is not None else None,
        "recommendation": Recommendation.SELECT.value if technical_rating is not None else None,
        "created_at": datetime.utcnow(),
        "updated_at": None,
        "created_by": str(ObjectId()),
        "updated_by": None,
    }

def current_user():
    return {"_id": ObjectId(), "email": "hr@nucleusteq.com", "role": UserRole.HR.value}

def interviewer_user(interviewer_id=None):
    user_id = ObjectId(interviewer_id) if interviewer_id else ObjectId()
    return {"_id": user_id, "email": "interviewer@nucleusteq.com", "role": UserRole.INTERVIEWER.value}

class ScheduleRequestMock:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    def model_dump(self):
        return self.__dict__

class UpdateRequestMock:
    def __init__(self, **kwargs):
        self._data = kwargs

    def model_dump(self, exclude_unset=False):
        return self._data

class FeedbackRequestMock:
    def __init__(self, technical_rating=4, communication_rating=5, comments="Good", recommendation=Recommendation.SELECT):
        self.technical_rating = technical_rating
        self.communication_rating = communication_rating
        self.comments = comments
        self.recommendation = recommendation

def _mock_schedule_payload(**kwargs):
    defaults = {
        "candidate_id": str(ObjectId()),
        "interviewer_id": str(ObjectId()),
        "interview_date": date(2099, 12, 1),
        "interview_time": time(10, 0),
        "interview_mode": InterviewMode.ONLINE,
        "meeting_link": "https://meet.example.com",
        "location": None,
    }
    defaults.update(kwargs)
    return ScheduleRequestMock(**defaults)

class TestScheduleInterview:
    @pytest.mark.asyncio
    async def test_schedule_interview_success(self, mocker):
        payload = _mock_schedule_payload()
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc(payload.candidate_id)))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc(payload.interviewer_id)))
        mocker.patch("src.services.interview_service.interview_repository.get_candidate_interview", new=AsyncMock(return_value=None))
        mocker.patch("src.services.interview_service.interview_repository.get_interviewer_interview", new=AsyncMock(return_value=None))
        create_mock = mocker.patch("src.services.interview_service.interview_repository.create_interview", new=AsyncMock(return_value=mocker.Mock(inserted_id=ObjectId())))
        result = await interview_service.schedule_interview(payload, current_user())
        created_data = create_mock.await_args.args[0]
        assert result.message == "Interview scheduled successfully."
        assert result.interview.candidate.name == "Prachi Verma"
        assert result.interview.interviewer.name == "Interviewer One"
        assert result.interview.interview_date == date(2099, 12, 1)
        assert created_data["interview_datetime"] == datetime(2099, 12, 1, 10, 0)

    @pytest.mark.asyncio
    async def test_schedule_interview_candidate_not_found(self, mocker):
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=None))
        with pytest.raises(candidate_exceptions.CandidateNotFoundException):
            await interview_service.schedule_interview(_mock_schedule_payload(), current_user())

    @pytest.mark.asyncio
    async def test_schedule_interview_interviewer_not_found(self, mocker):
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc()))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=None))
        with pytest.raises(interview_exceptions.InvalidInterviewerException):
            await interview_service.schedule_interview(_mock_schedule_payload(), current_user())

    @pytest.mark.asyncio
    async def test_schedule_interview_invalid_interviewer_role(self, mocker):
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc()))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc(role=UserRole.HR.value)))
        with pytest.raises(interview_exceptions.InvalidInterviewerException, match="INTERVIEWER role"):
            await interview_service.schedule_interview(_mock_schedule_payload(), current_user())

    @pytest.mark.asyncio
    async def test_schedule_interview_past_datetime(self, mocker):
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc()))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc()))
        with pytest.raises(interview_exceptions.InvalidInterviewDateException):
            await interview_service.schedule_interview(_mock_schedule_payload(interview_date=date(2000, 1, 1)), current_user())

    @pytest.mark.asyncio
    async def test_schedule_interview_online_missing_link(self, mocker):
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc()))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc()))
        with pytest.raises(interview_exceptions.MeetingLinkRequiredException):
            await interview_service.schedule_interview(_mock_schedule_payload(interview_mode=InterviewMode.ONLINE, meeting_link=None), current_user())

    @pytest.mark.asyncio
    async def test_schedule_interview_offline_missing_location(self, mocker):
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc()))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc()))
        with pytest.raises(interview_exceptions.LocationRequiredException):
            await interview_service.schedule_interview(_mock_schedule_payload(interview_mode=InterviewMode.OFFLINE, meeting_link=None, location=None), current_user())

    @pytest.mark.asyncio
    async def test_schedule_interview_candidate_conflict(self, mocker):
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc()))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc()))
        mocker.patch("src.services.interview_service.interview_repository.get_candidate_interview", new=AsyncMock(return_value=interview_doc()))
        with pytest.raises(interview_exceptions.InvalidInterviewDateException, match="Candidate already has an interview"):
            await interview_service.schedule_interview(_mock_schedule_payload(), current_user())

    @pytest.mark.asyncio
    async def test_schedule_interview_interviewer_conflict(self, mocker):
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc()))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc()))
        mocker.patch("src.services.interview_service.interview_repository.get_candidate_interview", new=AsyncMock(return_value=None))
        mocker.patch("src.services.interview_service.interview_repository.get_interviewer_interview", new=AsyncMock(return_value=interview_doc()))
        with pytest.raises(interview_exceptions.InvalidInterviewDateException, match="Interviewer already has an interview"):
            await interview_service.schedule_interview(_mock_schedule_payload(), current_user())

class TestGetInterviews:
    @pytest.mark.asyncio
    async def test_get_interviews_success(self, mocker):
        doc = interview_doc()
        mocker.patch("src.services.interview_service.interview_repository.get_interviews", new=AsyncMock(return_value={"interviews": [doc], "total": 1, "page": 1, "limit": 10, "total_pages": 1}))
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc(doc["candidate_id"])))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc(doc["interviewer_id"])))
        result = await interview_service.get_interviews()
        assert result.message == "Interviews retrieved successfully."
        assert result.total == 1
        assert result.interviews[0].candidate.name == "Prachi Verma"

    @pytest.mark.asyncio
    async def test_get_interviews_empty(self, mocker):
        mocker.patch("src.services.interview_service.interview_repository.get_interviews", new=AsyncMock(return_value={"interviews": [], "total": 0, "page": 1, "limit": 10, "total_pages": 0}))
        result = await interview_service.get_interviews()
        assert result.total == 0
        assert len(result.interviews) == 0

class TestGetInterviewById:
    @pytest.mark.asyncio
    async def test_get_interview_by_id_success(self, mocker):
        interview_id = str(ObjectId())
        doc = interview_doc(interview_id)
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=doc))
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc(doc["candidate_id"])))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc(doc["interviewer_id"])))
        result = await interview_service.get_interview_by_id(interview_id)
        assert result.message == "Interview retrieved successfully."
        assert result.interview.interview_time == time(10, 0)

    @pytest.mark.asyncio
    async def test_get_interview_by_id_not_found(self, mocker):
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=None))
        with pytest.raises(interview_exceptions.InterviewNotFoundException):
            await interview_service.get_interview_by_id(str(ObjectId()))

    @pytest.mark.asyncio
    async def test_get_interview_by_id_invalid_id(self):
        with pytest.raises(interview_exceptions.InterviewNotFoundException):
            await interview_service.get_interview_by_id("invalid_id")

class TestUpdateInterview:
    @pytest.mark.asyncio
    async def test_update_interview_success(self, mocker):
        interview_id = str(ObjectId())
        doc = interview_doc(interview_id)
        updated = doc.copy()
        updated["interview_datetime"] = datetime(2099, 12, 1, 11, 0)
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(side_effect=[doc, updated]))
        mocker.patch("src.services.interview_service.interview_repository.get_candidate_interview_except", new=AsyncMock(return_value=None))
        mocker.patch("src.services.interview_service.interview_repository.get_interviewer_interview_except", new=AsyncMock(return_value=None))
        update_mock = mocker.patch("src.services.interview_service.interview_repository.update_interview", new=AsyncMock())
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc(doc["candidate_id"])))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc(doc["interviewer_id"])))
        result = await interview_service.update_interview(interview_id, UpdateRequestMock(interview_time=time(11, 0)), current_user())
        update_data = update_mock.await_args.args[1]
        assert result.interview_time == time(11, 0)
        assert update_data["interview_datetime"] == datetime(2099, 12, 1, 11, 0)
        assert "interview_date" not in update_data
        assert "interview_time" not in update_data

    @pytest.mark.asyncio
    async def test_update_interview_assigned_interviewer_can_reschedule(self, mocker):
        interview_id = str(ObjectId())
        doc = interview_doc(interview_id)
        user = interviewer_user(doc["interviewer_id"])
        updated = doc.copy()
        updated["interview_datetime"] = datetime(2099, 12, 1, 11, 0)
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(side_effect=[doc, updated]))
        mocker.patch("src.services.interview_service.interview_repository.get_candidate_interview_except", new=AsyncMock(return_value=None))
        mocker.patch("src.services.interview_service.interview_repository.get_interviewer_interview_except", new=AsyncMock(return_value=None))
        mocker.patch("src.services.interview_service.interview_repository.update_interview", new=AsyncMock())
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc(doc["candidate_id"])))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=interviewer_doc(doc["interviewer_id"])))
        result = await interview_service.update_interview(interview_id, UpdateRequestMock(interview_time=time(11, 0)), user)
        assert result.interview_time == time(11, 0)

    @pytest.mark.asyncio
    async def test_update_interview_interviewer_cannot_update_details(self, mocker):
        interview_id = str(ObjectId())
        doc = interview_doc(interview_id)
        user = interviewer_user(doc["interviewer_id"])
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=doc))
        with pytest.raises(interview_exceptions.InvalidInterviewerException, match="only reschedule"):
            await interview_service.update_interview(interview_id, UpdateRequestMock(interview_mode=InterviewMode.OFFLINE, location="Room 1"), user)

    @pytest.mark.asyncio
    async def test_update_interview_unassigned_interviewer_cannot_reschedule(self, mocker):
        interview_id = str(ObjectId())
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=interview_doc(interview_id)))
        with pytest.raises(interview_exceptions.InvalidInterviewerException, match="assigned interviewer"):
            await interview_service.update_interview(interview_id, UpdateRequestMock(interview_time=time(11, 0)), interviewer_user())

    @pytest.mark.asyncio
    async def test_update_interview_not_found(self, mocker):
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=None))
        with pytest.raises(interview_exceptions.InterviewNotFoundException):
            await interview_service.update_interview(str(ObjectId()), UpdateRequestMock(interview_time=time(11, 0)), current_user())

    @pytest.mark.asyncio
    async def test_update_interview_invalid_interviewer(self, mocker):
        interview_id = str(ObjectId())
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=interview_doc(interview_id)))
        mocker.patch("src.services.interview_service.user_repository.find_user_by_id", new=AsyncMock(return_value=None))
        with pytest.raises(interview_exceptions.InvalidInterviewerException):
            await interview_service.update_interview(interview_id, UpdateRequestMock(interviewer_id=str(ObjectId())), current_user())

    @pytest.mark.asyncio
    async def test_update_interview_past_datetime(self, mocker):
        interview_id = str(ObjectId())
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=interview_doc(interview_id)))
        with pytest.raises(interview_exceptions.InvalidInterviewDateException):
            await interview_service.update_interview(interview_id, UpdateRequestMock(interview_date=date(2000, 1, 1)), current_user())

    @pytest.mark.asyncio
    async def test_update_interview_candidate_conflict(self, mocker):
        interview_id = str(ObjectId())
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=interview_doc(interview_id)))
        mocker.patch("src.services.interview_service.interview_repository.get_candidate_interview_except", new=AsyncMock(return_value=interview_doc()))
        with pytest.raises(interview_exceptions.InvalidInterviewDateException, match="Candidate already has an interview"):
            await interview_service.update_interview(interview_id, UpdateRequestMock(interview_time=time(11, 0)), current_user())

    @pytest.mark.asyncio
    async def test_update_interview_interviewer_conflict(self, mocker):
        interview_id = str(ObjectId())
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=interview_doc(interview_id)))
        mocker.patch("src.services.interview_service.interview_repository.get_candidate_interview_except", new=AsyncMock(return_value=None))
        mocker.patch("src.services.interview_service.interview_repository.get_interviewer_interview_except", new=AsyncMock(return_value=interview_doc()))
        with pytest.raises(interview_exceptions.InvalidInterviewDateException, match="Interviewer already has an interview"):
            await interview_service.update_interview(interview_id, UpdateRequestMock(interview_time=time(11, 0)), current_user())

class TestSubmitFeedback:
    @pytest.mark.asyncio
    async def test_submit_feedback_success(self, mocker):
        interview_id = str(ObjectId())
        user = interviewer_user()
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=interview_doc(interview_id, interviewer_id=str(user["_id"]))))
        update_mock = mocker.patch("src.services.interview_service.interview_repository.update_interview", new=AsyncMock())
        result = await interview_service.submit_feedback(interview_id, FeedbackRequestMock(), user)
        update_data = update_mock.await_args.args[1]
        assert result.message == "Feedback submitted successfully."
        assert result.technical_rating == 4
        assert result.communication_rating == 5
        assert update_data["status"] == InterviewStatus.COMPLETED.value

    @pytest.mark.asyncio
    async def test_submit_feedback_duplicate(self, mocker):
        interview_id = str(ObjectId())
        user = interviewer_user()
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=interview_doc(interview_id, interviewer_id=str(user["_id"]), technical_rating=4, communication_rating=5)))
        with pytest.raises(interview_exceptions.FeedbackAlreadySubmittedException):
            await interview_service.submit_feedback(interview_id, FeedbackRequestMock(), user)

    @pytest.mark.asyncio
    async def test_submit_feedback_invalid_interviewer(self, mocker):
        interview_id = str(ObjectId())
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=interview_doc(interview_id)))
        with pytest.raises(interview_exceptions.InvalidInterviewerException):
            await interview_service.submit_feedback(interview_id, FeedbackRequestMock(), interviewer_user())

    @pytest.mark.asyncio
    async def test_submit_feedback_interview_not_found(self, mocker):
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=None))
        with pytest.raises(interview_exceptions.InterviewNotFoundException):
            await interview_service.submit_feedback(str(ObjectId()), FeedbackRequestMock(), interviewer_user())

class TestGetFeedback:
    @pytest.mark.asyncio
    async def test_get_feedback_success(self, mocker):
        interview_id = str(ObjectId())
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=interview_doc(interview_id, technical_rating=4, communication_rating=5)))
        result = await interview_service.get_feedback(interview_id)
        assert result.message == "Feedback retrieved successfully."
        assert result.technical_rating == 4
        assert result.communication_rating == 5

    @pytest.mark.asyncio
    async def test_get_feedback_not_submitted(self, mocker):
        interview_id = str(ObjectId())
        mocker.patch("src.services.interview_service.interview_repository.get_interview_by_id", new=AsyncMock(return_value=interview_doc(interview_id)))
        with pytest.raises(interview_exceptions.InterviewNotFoundException):
            await interview_service.get_feedback(interview_id)

class TestHRDashboard:
    @pytest.mark.asyncio
    async def test_hr_dashboard_success(self, mocker):
        job_collection = mocker.Mock(count_documents=AsyncMock(return_value=5))
        candidate_collection = mocker.Mock(count_documents=AsyncMock(side_effect=[10, 2, 1]))
        mocker.patch("src.services.interview_service.job_repository.get_job_collection", return_value=job_collection)
        mocker.patch("src.services.interview_service.candidate_repository.get_candidate_collection", return_value=candidate_collection)
        mocker.patch("src.services.interview_service.interview_repository.count_scheduled_interviews", new=AsyncMock(return_value=3))
        result = await interview_service.get_hr_dashboard()
        assert result.total_jobs == 5
        assert result.total_candidates == 10
        assert result.scheduled_interviews == 3
        assert result.selected_candidates == 2
        assert result.rejected_candidates == 1

class TestInterviewerDashboard:
    @pytest.mark.asyncio
    async def test_interviewer_dashboard_success(self, mocker):
        interviewer_id = str(ObjectId())
        user = {"_id": ObjectId(interviewer_id), "role": UserRole.INTERVIEWER.value}
        mocker.patch("src.services.interview_service.interview_repository.count_assigned_interviews", new=AsyncMock(return_value=2))
        mocker.patch("src.services.interview_service.interview_repository.count_pending_feedback", new=AsyncMock(return_value=1))
        mocker.patch("src.services.interview_service.interview_repository.count_completed_feedback", new=AsyncMock(return_value=1))
        result = await interview_service.get_interviewer_dashboard(user)
        assert result.assigned_interviews == 2
        assert result.pending_feedback == 1
        assert result.completed_feedback == 1

    @pytest.mark.asyncio
    async def test_interviewer_dashboard_no_interviews(self, mocker):
        user = {"_id": ObjectId(), "role": UserRole.INTERVIEWER.value}
        mocker.patch("src.services.interview_service.interview_repository.count_assigned_interviews", new=AsyncMock(return_value=0))
        mocker.patch("src.services.interview_service.interview_repository.count_pending_feedback", new=AsyncMock(return_value=0))
        mocker.patch("src.services.interview_service.interview_repository.count_completed_feedback", new=AsyncMock(return_value=0))
        result = await interview_service.get_interviewer_dashboard(user)
        assert result.assigned_interviews == 0
        assert result.pending_feedback == 0
        assert result.completed_feedback == 0
