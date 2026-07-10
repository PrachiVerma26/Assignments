"""Service tests for candidate management workflows."""

from datetime import datetime, UTC
from bson import ObjectId
import pytest
from unittest.mock import AsyncMock
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
        "total_experience": "2 Years 6 Months",
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
        "total_experience": "2 Years 6 Months",
        "applied_job_id": str(ObjectId()),
    }
    data.update(kwargs)
    return CreateCandidateRequestMock(**data)

class TestCreateCandidate:
    @pytest.mark.asyncio
    async def test_create_candidate_success(self, mocker):
        mocker.patch( "src.services.candidate_service.candidate_repository.get_candidate_by_email", new=AsyncMock(return_value=None))
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_mobile", new=AsyncMock(return_value=None))
        mocker.patch("src.services.candidate_service.candidate_repository.create_candidate", new=AsyncMock(return_value=mocker.Mock(inserted_id=ObjectId())))
        result = await candidate_service.create_candidate(create_request(), current_user())
        assert result.message == "Candidate created successfully."
        assert result.candidate.status == CandidateStatus.PROFILE_CREATED

    @pytest.mark.asyncio
    async def test_create_candidate_invalid_email(self):
        with pytest.raises(InvalidNucleusTeqEmailException):
            await candidate_service.create_candidate(create_request(email="test@gmail.com"), current_user())

    @pytest.mark.asyncio
    async def test_create_candidate_duplicate_email(self, mocker):
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", new=AsyncMock(return_value=candidate_doc()))
        with pytest.raises(CandidateEmailAlreadyExistsException):
            await candidate_service.create_candidate(create_request(), current_user())

    @pytest.mark.asyncio
    async def test_create_candidate_duplicate_mobile(self, mocker):
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", new=AsyncMock(return_value=None))
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_mobile",new=AsyncMock(return_value=candidate_doc()))
        with pytest.raises(CandidateMobileAlreadyExistsException):
            await candidate_service.create_candidate(create_request(), current_user())

class TestGetCandidates:
    @pytest.mark.asyncio
    async def test_get_candidates_success(self, mocker):
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidates",
            new=AsyncMock(
                return_value={
                    "candidates": [candidate_doc()],
                    "total": 1,
                    "page": 1,
                    "limit": 10,
                    "total_pages": 1,}))
        result = await candidate_service.get_candidates()
        assert result.message == "Candidates retrieved successfully."
        assert result.total == 1
        assert len(result.candidates) == 1

    @pytest.mark.asyncio
    async def test_get_candidates_empty(self, mocker):
        mocker.patch(
            "src.services.candidate_service.candidate_repository.get_candidates",
            new=AsyncMock(
                return_value={
                    "candidates": [],
                    "total": 0,
                    "page": 1,
                    "limit": 10,
                    "total_pages": 0,
                }
            ),
        )
        result = await candidate_service.get_candidates()
        assert result.total == 0
        assert len(result.candidates) == 0

    @pytest.mark.asyncio
    async def test_get_candidates_with_search(self, mocker):
        mock_repo = mocker.patch(
            "src.services.candidate_service.candidate_repository.get_candidates",
            new=AsyncMock(
                return_value={
                    "candidates": [],
                    "total": 0,
                    "page": 1,
                    "limit": 10,
                    "total_pages": 0}),
        )
        await candidate_service.get_candidates(page=1, limit=10, search="Prachi")
        mock_repo.assert_awaited_once_with(1, 10, "Prachi")

class TestGetCandidateById:
    @pytest.mark.asyncio
    async def test_get_candidate_by_id_success(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc(candidate_id)))
        result = await candidate_service.get_candidate_by_id(candidate_id)
        assert result.first_name == "Prachi"
        assert result.email == "prachi.verma@nucleusteq.com"
        
    @pytest.mark.asyncio
    async def test_get_candidate_by_id_invalid_objectid(self):
        with pytest.raises(CandidateNotFoundException, match="Candidate not found."):
            await candidate_service.get_candidate_by_id("invalid_id")

class TestUpdateCandidate:
    @pytest.mark.asyncio
    async def test_update_candidate_success(self, mocker):
        candidate_id = str(ObjectId())
        doc = candidate_doc(candidate_id)
        updated = doc.copy()
        updated["current_company"] = "New Corp"
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", new=AsyncMock(side_effect=[doc, updated]))
        mocker.patch("src.services.candidate_service.candidate_repository.update_candidate", new=AsyncMock())
        result = await candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(current_company="New Corp"))
        assert result.current_company == "New Corp"

    @pytest.mark.asyncio
    async def test_update_candidate_not_found(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch(
            "src.services.candidate_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=None))
        with pytest.raises(CandidateNotFoundException, match="Candidate not found."):
            await candidate_service.update_candidate(
                candidate_id, UpdateCandidateRequestMock(current_company="New Corp")
            )

    @pytest.mark.asyncio
    async def test_update_candidate_invalid_objectid(self):
        with pytest.raises(CandidateNotFoundException, match="Candidate not found."):
            await candidate_service.update_candidate("invalid_id", UpdateCandidateRequestMock(current_company="New Corp"))

    @pytest.mark.asyncio
    async def test_update_candidate_invalid_email(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch( "src.services.candidate_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc(candidate_id)))
        with pytest.raises(InvalidNucleusTeqEmailException):
            await candidate_service.update_candidate( candidate_id, UpdateCandidateRequestMock(email="test@gmail.com"))

    @pytest.mark.asyncio
    async def test_update_candidate_duplicate_email(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc(candidate_id)))
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", new=AsyncMock(return_value=candidate_doc()))
        with pytest.raises(CandidateEmailAlreadyExistsException):
            await candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(email="other@nucleusteq.com"))

    @pytest.mark.asyncio
    async def test_update_candidate_duplicate_mobile(self, mocker):
        candidate_id = str(ObjectId())
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", new=AsyncMock(return_value=candidate_doc(candidate_id)))
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_mobile", new=AsyncMock(return_value=candidate_doc()))
        with pytest.raises(CandidateMobileAlreadyExistsException):
            await candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(mobile="9999999999"))

    @pytest.mark.asyncio
    async def test_update_candidate_same_email(self, mocker):
        candidate_id = str(ObjectId())
        doc = candidate_doc(candidate_id)
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_id", new=AsyncMock(side_effect=[doc, doc.copy()]))
        mocker.patch("src.services.candidate_service.candidate_repository.get_candidate_by_email", new=AsyncMock(return_value=doc))
        mocker.patch("src.services.candidate_service.candidate_repository.update_candidate", new=AsyncMock())
        result = await candidate_service.update_candidate(candidate_id, UpdateCandidateRequestMock(email="prachi.verma@nucleusteq.com"))
        assert result.email == "prachi.verma@nucleusteq.com"
