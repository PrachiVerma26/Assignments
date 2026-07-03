"""Service tests for candidate management workflows."""

from datetime import datetime
from bson import ObjectId
import pytest
from src.services import candidate_service
from src.enums.candidate_status import CandidateStatus
from src.exceptions.candidate_exceptions import CandidateNotFoundException, CandidateEmailAlreadyExistsException, CandidateMobileAlreadyExistsException, InvalidNucleusTeqEmailException

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
    def test_get_candidate_by_id_success(self,mocker):
        candidate_id=str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        result=candidate_service.get_candidate_by_id(candidate_id)
        assert result.first_name=="Prachi"
        assert result.email=="prachi.verma@nucleusteq.com"

    def test_get_candidate_by_id_not_found(self,mocker):
        candidate_id=str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=None)
        with pytest.raises(CandidateNotFoundException,match="Candidate not found."):
            candidate_service.get_candidate_by_id(candidate_id)

    def test_get_candidate_by_id_invalid_objectid(self):
        with pytest.raises(CandidateNotFoundException,match="Candidate not found."):
            candidate_service.get_candidate_by_id("invalid_id")

class TestUpdateCandidate:
    def test_update_candidate_success(self,mocker):
        candidate_id=str(ObjectId())
        doc=candidate_doc(candidate_id)
        updated=doc.copy()
        updated["current_company"]="New Corp"
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", side_effect=[doc,updated])
        mocker.patch("src.services.candidate_service.candidate_repository.update_candidate")
        result=candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(current_company="New Corp"))
        assert result.current_company=="New Corp"

    def test_update_candidate_not_found(self,mocker):
        candidate_id=str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=None)
        with pytest.raises(CandidateNotFoundException,match="Candidate not found."):
            candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(current_company="New Corp"))

    def test_update_candidate_invalid_objectid(self):
        with pytest.raises(CandidateNotFoundException,match="Candidate not found."):
            candidate_service.update_candidate("invalid_id", UpdateCandidateRequestMock(current_company="New Corp"))

    def test_update_candidate_invalid_email(self,mocker):
        candidate_id=str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        with pytest.raises(InvalidNucleusTeqEmailException):
            candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(email="test@gmail.com"))

    def test_update_candidate_duplicate_email(self,mocker):
        candidate_id=str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", return_value=candidate_doc())
        with pytest.raises(CandidateEmailAlreadyExistsException):
            candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(email="other@nucleusteq.com"))

    def test_update_candidate_duplicate_mobile(self,mocker):
        candidate_id=str(ObjectId())
        mocker.patch( "src.services.candidate_service.candidate_repository.get_candidate_by_id", return_value=candidate_doc(candidate_id))
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_mobile", return_value=candidate_doc())
        with pytest.raises(CandidateMobileAlreadyExistsException):
            candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(mobile="9999999999"))

    def test_update_candidate_same_email(self,mocker):
        candidate_id=str(ObjectId())
        doc=candidate_doc(candidate_id)
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", side_effect=[doc,doc.copy()])
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", return_value=doc)
        mocker.patch("src.services.candidate_service.candidate_repository.update_candidate")
        result=candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(email="prachi.verma@nucleusteq.com"))
        assert result.email=="prachi.verma@nucleusteq.com"