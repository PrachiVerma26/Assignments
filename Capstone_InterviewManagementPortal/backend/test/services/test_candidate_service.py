"""Service tests for candidate management workflows."""

from datetime import datetime
from bson import ObjectId
import pytest
from src.services import candidate_service
from src.enums.candidate_status import CandidateStatus
from src.exceptions.candidate_exceptions import (
    CandidateNotFoundException,
    CandidateEmailAlreadyExistsException,
    CandidateMobileAlreadyExistsException,
    InvalidNucleusTeqEmailException,
    ResumeNotFoundException,
    InvalidFileTypeException,
    EmptyFileException,
    ResumeUploadFailedException,
)


class CreateCandidateRequestMock:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    def model_dump(self):
        return self.__dict__


class UpdateCandidateRequestMock:
    def __init__(self, **kwargs):
        self._data = kwargs

    def model_dump(self, exclude_unset=False):
        if exclude_unset:
            return self._data
        return {
            "first_name": None,
            "last_name": None,
            "email": None,
            "mobile": None,
            "current_company": None,
            "total_experience": None,
            "applied_job_id": None,
            **self._data,
        }

@pytest.fixture(autouse=True)
def mock_logger(mocker):
    mocker.patch("src.services.candidate_service.app_logger")

def candidate_doc(candidate_id=None):
    return {
        "_id": ObjectId(candidate_id) if candidate_id else ObjectId(),
        "first_name": "Prachi",
        "last_name": "Verma",
        "email": "prachi.verma@nucleusteq.com",
        "mobile": "9876543210",
        "current_company": "NucleusTeq",
        "total_experience": 3.0,
        "applied_job_id": str(ObjectId()),
        "status": CandidateStatus.PROFILE_CREATED,
        "resume_file_id": None,
        "created_at": datetime.utcnow(),
        "updated_at": None,
    }

def current_user():
    return {"_id": ObjectId(), "email": "hr@nucleusteq.com"}

def create_request(**kwargs):
    data = {
        "first_name": "Prachi",
        "last_name": "Verma",
        "email": "prachi.verma@nucleusteq.com",
        "mobile": "9876543210",
        "current_company": "Acme Corp",
        "total_experience": 3.0,
        "applied_job_id": str(ObjectId()),
    }
    data.update(kwargs)
    return CreateCandidateRequestMock(**data)

class TestCreateCandidate:
    def test_create_candidate_success(self, mocker):
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", return_value=None)
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_mobile", return_value=None)
        result_obj = mocker.Mock(inserted_id=ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.create_candidate", return_value=result_obj)
        result = candidate_service.create_candidate(create_request(), current_user())
        assert result.message == "Candidate created successfully."
        assert result.candidate.status == CandidateStatus.PROFILE_CREATED

    def test_create_candidate_invalid_email(self):
        with pytest.raises(InvalidNucleusTeqEmailException):
            candidate_service.create_candidate(create_request(email="test@gmail.com"), current_user())

    def test_create_candidate_duplicate_email(self, mocker):
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", return_value=candidate_doc())
        with pytest.raises(CandidateEmailAlreadyExistsException):
            candidate_service.create_candidate(create_request(), current_user())

    def test_create_candidate_duplicate_mobile(self, mocker):
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", return_value=None)
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_mobile", return_value=candidate_doc())
        with pytest.raises(CandidateMobileAlreadyExistsException):
            candidate_service.create_candidate(create_request(), current_user())

class TestGetCandidates:
    def test_get_candidates_success(self, mocker):
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidates",
            return_value={
                "candidates": [candidate_doc()],
                "total": 1,
                "page": 1,
                "limit": 10,
                "total_pages": 1,}
        )
        result = candidate_service.get_candidates()
        assert result.message == "Candidates retrieved successfully."
        assert result.total == 1
        assert len(result.candidates) == 1

    def test_get_candidates_empty(self, mocker):
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidates",
            return_value={
                "candidates": [],
                "total": 0,
                "page": 1,
                "limit": 10,
                "total_pages": 0},
        )
        result = candidate_service.get_candidates()
        assert result.total == 0
        assert len(result.candidates) == 0

    def test_get_candidates_with_search(self, mocker):
        repo = mocker.patch("src.services.candidate_service.candidate_repository.get_candidates",
            return_value={
                "candidates": [],
                "total": 0,
                "page": 1,
                "limit": 10,
                "total_pages": 0}
        )
        candidate_service.get_candidates(page=1, limit=10, search="Prachi")
        repo.assert_called_once_with(1, 10, "Prachi")

class TestGetCandidateById:
    def test_get_candidate_by_id_success(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        result = candidate_service.get_candidate_by_id(candidate_id)
        assert result.first_name == "Prachi"
        assert result.email == "prachi.verma@nucleusteq.com"

    def test_get_candidate_by_id_not_found(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=None)
        with pytest.raises(CandidateNotFoundException, match="Candidate not found."):
            candidate_service.get_candidate_by_id(candidate_id)

    def test_get_candidate_by_id_invalid_objectid(self):
        with pytest.raises(CandidateNotFoundException, match="Candidate not found."):
            candidate_service.get_candidate_by_id("invalid_id")

class TestUpdateCandidate:
    def test_update_candidate_success(self, mocker):
        candidate_id = str(ObjectId())
        doc = candidate_doc(candidate_id)
        updated = doc.copy()
        updated["current_company"] = "New Corp"
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", side_effect=[doc, updated])
        mocker.patch("src.services.candidate_service.candidate_repository.update_candidate")
        result = candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(current_company="New Corp"))
        assert result.current_company == "New Corp"

    def test_update_candidate_not_found(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=None)
        with pytest.raises(CandidateNotFoundException, match="Candidate not found."):
            candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(current_company="New Corp"))

    def test_update_candidate_invalid_objectid(self):
        with pytest.raises(CandidateNotFoundException, match="Candidate not found."):
            candidate_service.update_candidate("invalid_id", UpdateCandidateRequestMock(current_company="New Corp"))

    def test_update_candidate_invalid_email(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        with pytest.raises(InvalidNucleusTeqEmailException):
            candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(email="test@gmail.com"))

    def test_update_candidate_duplicate_email(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", return_value=candidate_doc())
        with pytest.raises(CandidateEmailAlreadyExistsException):
            candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(email="other@nucleusteq.com"))

    def test_update_candidate_duplicate_mobile(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_mobile", return_value=candidate_doc())
        with pytest.raises(CandidateMobileAlreadyExistsException):
            candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(mobile="9999999999"))

    def test_update_candidate_same_email(self, mocker):
        candidate_id = str(ObjectId())
        doc = candidate_doc(candidate_id)
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", side_effect=[doc, doc.copy()])
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", return_value=doc)
        mocker.patch("src.services.candidate_service.candidate_repository.update_candidate")
        result = candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(email="prachi.verma@nucleusteq.com"))
        assert result.email == "prachi.verma@nucleusteq.com"

def _make_upload_file(mocker, content=b"%PDF-1.4 data", content_type="application/pdf", filename="resume.pdf"):
    mock_file = mocker.MagicMock()
    mock_file.content_type = content_type
    mock_file.filename = filename
    mock_file.file.read.return_value = content
    return mock_file

class TestUploadResume:
    def test_upload_resume_success(self, mocker):
        """Successfully upload a PDF and return file_id."""
        candidate_id = str(ObjectId())
        doc = candidate_doc(candidate_id)
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=doc)
        mocker.patch("src.services.candidate_service.candidate_repository.upload_resume", return_value="file_id_123")
        mocker.patch("src.services.candidate_service.candidate_repository.update_candidate")
        result = candidate_service.upload_resume(candidate_id, _make_upload_file(mocker))
        assert result.message == "Resume uploaded successfully."
        assert result.resume_file_id == "file_id_123"

    def test_upload_resume_candidate_not_found(self, mocker):
        """Raise CandidateNotFoundException when candidate does not exist."""
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=None)
        with pytest.raises(CandidateNotFoundException):
            candidate_service.upload_resume(str(ObjectId()), _make_upload_file(mocker))

    def test_upload_resume_invalid_file_type(self, mocker):
        """Raise InvalidFileTypeException for non-PDF files."""
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        with pytest.raises(InvalidFileTypeException):
            candidate_service.upload_resume(candidate_id, _make_upload_file(mocker, content_type="image/png"))

    def test_upload_resume_empty_file(self, mocker):
        """Raise EmptyFileException when file content is empty."""
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        with pytest.raises(EmptyFileException):
            candidate_service.upload_resume(candidate_id, _make_upload_file(mocker, content=b""))

    def test_upload_resume_gridfs_failure(self, mocker):
        """Raise ResumeUploadFailedException on GridFS error."""
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        mocker.patch("src.services.candidate_service.candidate_repository.upload_resume", side_effect=Exception("GridFS down"))
        with pytest.raises(ResumeUploadFailedException):
            candidate_service.upload_resume(candidate_id, _make_upload_file(mocker))

    def test_upload_resume_invalid_candidate_id(self, mocker):
        """Raise CandidateNotFoundException for invalid ObjectId."""
        with pytest.raises(CandidateNotFoundException):
            candidate_service.upload_resume("invalid_id", _make_upload_file(mocker))

class TestGetResume:
    def test_get_resume_success(self, mocker):
        """Return the GridFS file object when resume exists."""
        candidate_id = str(ObjectId())
        doc = candidate_doc(candidate_id)
        doc["resume_file_id"] = "file_id_123"
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=doc)
        fake_grid_file = mocker.MagicMock()
        mocker.patch("src.services.candidate_service.candidate_repository.get_resume", return_value=fake_grid_file)
        result = candidate_service.get_resume(candidate_id)
        assert result == fake_grid_file

    def test_get_resume_no_resume_on_candidate(self, mocker):
        """Raise ResumeNotFoundException when candidate has no resume_file_id."""
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        with pytest.raises(ResumeNotFoundException, match="No resume found"):
            candidate_service.get_resume(candidate_id)

    def test_get_resume_file_missing_in_gridfs(self, mocker):
        """Raise ResumeNotFoundException when GridFS returns None."""
        candidate_id = str(ObjectId())
        doc = candidate_doc(candidate_id)
        doc["resume_file_id"] = "file_id_123"
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=doc)
        mocker.patch("src.services.candidate_service.candidate_repository.get_resume", return_value=None)
        with pytest.raises(ResumeNotFoundException, match="Resume file not found"):
            candidate_service.get_resume(candidate_id)

class TestUpdateCandidateStatus:
    def test_update_status_success(self, mocker):
        """Update status and return CandidateStatusUpdateResponse."""
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        mock_update = mocker.patch("src.services.candidate_service.candidate_repository.update_candidate")
        mock_push = mocker.patch("src.services.candidate_service.candidate_repository.push_status_history")
        result = candidate_service.update_candidate_status(candidate_id, CandidateStatus.SHORTLISTED, current_user())
        assert result.message == "Candidate status updated successfully."
        assert result.status == CandidateStatus.SHORTLISTED
        assert result.candidate_id == candidate_id
        mock_update.assert_called_once()
        mock_push.assert_called_once()

    def test_update_status_records_history(self, mocker):
        """Verify history entry contains correct previous and new status."""
        candidate_id = str(ObjectId())
        doc = candidate_doc(candidate_id)
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=doc)
        mocker.patch("src.services.candidate_service.candidate_repository.update_candidate")
        mock_push = mocker.patch("src.services.candidate_service.candidate_repository.push_status_history")
        candidate_service.update_candidate_status(candidate_id, CandidateStatus.APPLIED, current_user())
        history_entry = mock_push.call_args[0][1]
        assert history_entry["previous_status"] == CandidateStatus.PROFILE_CREATED.value
        assert history_entry["new_status"] == CandidateStatus.APPLIED.value

    def test_update_status_candidate_not_found(self, mocker):
        """Raise CandidateNotFoundException when candidate does not exist."""
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=None)
        with pytest.raises(CandidateNotFoundException):
            candidate_service.update_candidate_status(str(ObjectId()), CandidateStatus.HIRED, current_user())

class TestGetStatusHistory:
    def test_get_status_history_success(self, mocker):
        """Return ordered status history entries."""
        candidate_id = str(ObjectId())
        doc = candidate_doc(candidate_id)
        doc["status_history"] = [
            {"previous_status": None, "new_status": "PROFILE_CREATED", "updated_at": datetime.utcnow(), "updated_by": "user1"},
            {"previous_status": "PROFILE_CREATED", "new_status": "APPLIED", "updated_at": datetime.utcnow(), "updated_by": "user1"},
        ]
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=doc)
        result = candidate_service.get_status_history(candidate_id)
        assert result.candidate_id == candidate_id
        assert len(result.status_history) == 2
        assert result.status_history[0].new_status == "PROFILE_CREATED"
        assert result.status_history[1].new_status == "APPLIED"

    def test_get_status_history_candidate_not_found(self, mocker):
        """Raise CandidateNotFoundException when candidate does not exist."""
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=None)
        with pytest.raises(CandidateNotFoundException):
            candidate_service.get_status_history(str(ObjectId()))

    