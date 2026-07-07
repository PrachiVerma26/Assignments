from bson import ObjectId
from src.constants.auth_constants import CANDIDATE_COLLECTION
from src.repositories import candidate_repository as repository

def patch_candidate_collection(mocker):
    """Helper to patch the candidate collection."""
    collection = mocker.Mock()
    mocker.patch("src.repositories.candidate_repository.db", {CANDIDATE_COLLECTION: collection})
    return collection

def test_create_candidate_success(mocker):
    """Insert a candidate document and return the insert result."""
    collection = patch_candidate_collection(mocker)
    insert_result = mocker.Mock(inserted_id=ObjectId())
    collection.insert_one.return_value = insert_result

    candidate_data = {
        "first_name": "Prachi",
        "last_name": "Verma",
        "email": "prachi.verma@nucleusteq.com",
        "mobile": "9876543210",
        "current_company": "Acme Corp",
        "total_experience": 3.0,
        "applied_job_id": str(ObjectId()),
        "status": "PROFILE_CREATED",
        "created_by": str(ObjectId()),
    }
    result = repository.create_candidate(candidate_data)
    assert result.inserted_id == insert_result.inserted_id
    collection.insert_one.assert_called_once_with(candidate_data)

def test_get_candidates_with_pagination_success(mocker):
    """Return paginated candidates with correct metadata."""
    collection = patch_candidate_collection(mocker)
    candidates = [
        {"_id": ObjectId(), "first_name": "Prachi", "email": "prachi@nucleusteq.com"},
        {"_id": ObjectId(), "first_name": "Aman", "email": "aman@nucleusteq.com"},
    ]
    collection.count_documents.return_value = 15
    collection.find.return_value.sort.return_value.skip.return_value.limit.return_value = candidates
    result = repository.get_candidates(page=2, limit=10, search=None)
    assert result["candidates"] == candidates
    assert result["total"] == 15
    assert result["page"] == 2
    assert result["limit"] == 10
    assert result["total_pages"] == 2
    collection.count_documents.assert_called_once_with({})


def test_get_candidates_with_search_success(mocker):
    """Apply a search filter across first_name, last_name, and email fields."""
    collection = patch_candidate_collection(mocker)
    collection.count_documents.return_value = 3
    collection.find.return_value.sort.return_value.skip.return_value.limit.return_value = []
    search_term = "Prachi"
    expected_query = {
        "$or": [
            {"first_name": {"$regex": search_term, "$options": "i"}},
            {"last_name": {"$regex": search_term, "$options": "i"}},
            {"email": {"$regex": search_term, "$options": "i"}},
        ]
    }
    result = repository.get_candidates(page=1, limit=10, search=search_term)
    assert result["total"] == 3
    assert result["page"] == 1
    assert result["total_pages"] == 1
    collection.count_documents.assert_called_once_with(expected_query)
    collection.find.assert_called_once_with(expected_query)

def test_get_candidates_empty_result(mocker):
    """Return an empty list with zero totals when no candidates exist."""
    collection = patch_candidate_collection(mocker)
    collection.count_documents.return_value = 0
    collection.find.return_value.sort.return_value.skip.return_value.limit.return_value = []
    result = repository.get_candidates(page=1, limit=10)
    assert result["candidates"] == []
    assert result["total"] == 0
    assert result["total_pages"] == 0

def test_get_candidate_by_id_success(mocker):
    """Return the candidate document when the ID exists."""
    collection = patch_candidate_collection(mocker)
    candidate_id = ObjectId()
    expected = {"_id": candidate_id, "email": "prachi.verma@nucleusteq.com"}
    collection.find_one.return_value = expected
    result = repository.get_candidate_by_id(str(candidate_id))
    assert result == expected
    collection.find_one.assert_called_once_with({"_id": candidate_id})

def test_get_candidate_by_id_not_found(mocker):
    """Return None when no candidate matches the given ID."""
    collection = patch_candidate_collection(mocker)
    candidate_id = ObjectId()
    collection.find_one.return_value = None
    result = repository.get_candidate_by_id(str(candidate_id))
    assert result is None
    collection.find_one.assert_called_once_with({"_id": candidate_id})

def test_get_candidate_by_email_success(mocker):
    """Return the candidate document when the email exists."""
    collection = patch_candidate_collection(mocker)
    expected = {"_id": ObjectId(), "email": "prachi.verma@nucleusteq.com"}
    collection.find_one.return_value = expected
    result = repository.get_candidate_by_email("prachi.verma@nucleusteq.com")
    assert result == expected
    collection.find_one.assert_called_once_with({"email": "prachi.verma@nucleusteq.com"})

def test_get_candidate_by_email_not_found(mocker):
    """Return None when no candidate matches the given email."""
    collection = patch_candidate_collection(mocker)
    collection.find_one.return_value = None
    result = repository.get_candidate_by_email("unknown@nucleusteq.com")
    assert result is None

def test_get_candidate_by_mobile_success(mocker):
    """Return the candidate document when the mobile number exists."""
    collection = patch_candidate_collection(mocker)
    expected = {"_id": ObjectId(), "mobile": "9876543210"}
    collection.find_one.return_value = expected
    result = repository.get_candidate_by_mobile("9876543210")
    assert result == expected
    collection.find_one.assert_called_once_with({"mobile": "9876543210"})

def test_get_candidate_by_mobile_not_found(mocker):
    """Return None when no candidate matches the given mobile number."""
    collection = patch_candidate_collection(mocker)
    collection.find_one.return_value = None
    result = repository.get_candidate_by_mobile("0000000000")
    assert result is None

def test_update_candidate_success(mocker):
    """Apply a $set update and return the update result."""
    collection = patch_candidate_collection(mocker)
    update_result = mocker.Mock(modified_count=1)
    collection.update_one.return_value = update_result
    candidate_id = ObjectId()
    update_data = {"current_company": "New Corp"}
    result = repository.update_candidate(str(candidate_id), update_data)
    assert result.modified_count == 1
    collection.update_one.assert_called_once_with(
        {"_id": candidate_id},
        {"$set": update_data},
    )

# resume upload test cases 
def test_upload_resume_success(mocker):
    """Store PDF bytes in GridFS and return a string file_id."""
    fake_id = ObjectId()
    mock_fs = mocker.MagicMock()
    mock_fs.put.return_value = fake_id
    mocker.patch("src.repositories.candidate_repository.gridfs.GridFS", return_value=mock_fs)
    mocker.patch("src.repositories.candidate_repository.db", {})
    result = repository.upload_resume(b"%PDF-1.4 content", "resume.pdf")
    assert result == str(fake_id)
    mock_fs.put.assert_called_once_with(b"%PDF-1.4 content", filename="resume.pdf", content_type="application/pdf")

def test_upload_resume_gridfs_failure(mocker):
    """Propagate GridFS exceptions on upload failure."""
    mock_fs = mocker.MagicMock()
    mock_fs.put.side_effect = Exception("GridFS error")
    mocker.patch("src.repositories.candidate_repository.gridfs.GridFS", return_value=mock_fs)
    mocker.patch("src.repositories.candidate_repository.db", {})
    import pytest
    with pytest.raises(Exception, match="GridFS error"):
        repository.upload_resume(b"data", "resume.pdf")

def test_delete_resume_success(mocker):
    """Delete a GridFS file by file_id without error."""
    mock_fs = mocker.MagicMock()
    mocker.patch("src.repositories.candidate_repository.gridfs.GridFS", return_value=mock_fs)
    mocker.patch("src.repositories.candidate_repository.db", {})
    file_id = str(ObjectId())
    repository.delete_resume(file_id)
    mock_fs.delete.assert_called_once_with(ObjectId(file_id))

def test_get_resume_success(mocker):
    """Return the GridFS file object when it exists."""
    fake_file = mocker.MagicMock()
    mock_fs = mocker.MagicMock()
    mock_fs.get.return_value = fake_file
    mocker.patch("src.repositories.candidate_repository.gridfs.GridFS", return_value=mock_fs)
    mocker.patch("src.repositories.candidate_repository.db", {})
    file_id = str(ObjectId())
    result = repository.get_resume(file_id)
    assert result == fake_file
    mock_fs.get.assert_called_once_with(ObjectId(file_id))

def test_get_resume_not_found(mocker):
    """Return None when the GridFS file does not exist."""
    import gridfs as gfs
    mock_fs = mocker.MagicMock()
    mock_fs.get.side_effect = gfs.errors.NoFile
    mocker.patch("src.repositories.candidate_repository.gridfs.GridFS", return_value=mock_fs)
    mocker.patch("src.repositories.candidate_repository.db", {})
    result = repository.get_resume(str(ObjectId()))
    assert result is None

# status history test cases 
def test_push_status_history_success(mocker):
    """Append a status history entry using $push."""
    collection = patch_candidate_collection(mocker)
    candidate_id = ObjectId()
    entry = {"previous_status": "PROFILE_CREATED", "new_status": "APPLIED", "updated_at": "2024-01-01"}
    repository.push_status_history(str(candidate_id), entry)
    collection.update_one.assert_called_once_with(
        {"_id": candidate_id},
        {"$push": {"status_history": entry}},
    )
