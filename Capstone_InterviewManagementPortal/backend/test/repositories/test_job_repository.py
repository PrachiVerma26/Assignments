"""Unit tests for job repository MongoDB operations."""

from bson import ObjectId
from src.constants.auth_constants import JOB_COLLECTION
from src.repositories import job_repository as repository

def patch_job_collection(mocker):
    """Helper to patch the job collection."""
    collection = mocker.Mock()
    mocker.patch("src.repositories.job_repository.db", {JOB_COLLECTION: collection})
    return collection

def test_create_job_success(mocker):
    """Test successful job creation."""
    collection = patch_job_collection(mocker)
    insert_result = mocker.Mock(inserted_id=ObjectId())
    collection.insert_one.return_value = insert_result
    
    job_data = {
        "title": "Software Engineer",
        "description": "Develop software applications",
        "requirements": "Python, FastAPI experience",
        "location": "Remote",
        "employment_type": "Full-time",
        "salary_range": "$80,000 - $120,000",
        "department": "Engineering",
        "experience_level": "Mid-level"
    }

    result = repository.create_job(job_data)
    assert result.inserted_id == insert_result.inserted_id
    collection.insert_one.assert_called_once_with(job_data)

def test_get_jobs_with_pagination_success(mocker):
    """Test getting jobs with pagination."""
    collection = patch_job_collection(mocker)
    
    jobs = [
        {
            "_id": ObjectId(),
            "title": "Software Engineer",
            "description": "Develop software",
            "requirements": "Python",
            "location": "Remote",
            "employment_type": "Full-time",
            "salary_range": "$80k-$120k",
            "department": "Engineering",
            "experience_level": "Mid-level"
        },
        {
            "_id": ObjectId(),
            "title": "Data Scientist",
            "description": "Analyze data",
            "requirements": "Python, ML",
            "location": "On-site",
            "employment_type": "Full-time",
            "salary_range": "$90k-$130k",
            "department": "Data",
            "experience_level": "Senior"
        }
    ]
    
    collection.count_documents.return_value = 15
    collection.find.return_value.sort.return_value.skip.return_value.limit.return_value = jobs
    result = repository.get_jobs(page=2, limit=10, search=None)
    assert result["jobs"] == jobs
    assert result["total"] == 15
    assert result["page"] == 2
    assert result["limit"] == 10
    assert result["total_pages"] == 2
    collection.count_documents.assert_called_once_with({})

def test_get_jobs_with_search_success(mocker):
    """Test getting jobs with search filter."""
    collection = patch_job_collection(mocker)
    
    collection.count_documents.return_value = 5
    collection.find.return_value.sort.return_value.skip.return_value.limit.return_value = []

    search_term = "engineer"
    expected_query = {
        "$or": [
            {"title": {"$regex": search_term, "$options": "i"}},
            {"description": {"$regex": search_term, "$options": "i"}},
            {"department": {"$regex": search_term, "$options": "i"}},
            {"location": {"$regex": search_term, "$options": "i"}}
        ]
    }

    result = repository.get_jobs(page=1, limit=10, search=search_term)

    assert result["jobs"] == []
    assert result["total"] == 5
    assert result["page"] == 1
    assert result["limit"] == 10
    assert result["total_pages"] == 1
    collection.count_documents.assert_called_once_with(expected_query)
    collection.find.assert_called_once_with(expected_query)

def test_get_job_by_id_success(mocker):
    """Test successful job retrieval by ID."""
    collection = patch_job_collection(mocker)
    job_id = ObjectId()
    expected_job = { "_id": job_id,"title": "Software Engineer", "description": "Develop software applications"}
    collection.find_one.return_value = expected_job
    result = repository.get_job_by_id(str(job_id))
    assert result == expected_job
    collection.find_one.assert_called_once_with({"_id": job_id})

def test_get_job_by_id_not_found(mocker):
    """Test job retrieval when job doesn't exist."""
    collection = patch_job_collection(mocker)
    job_id = ObjectId()
    collection.find_one.return_value = None
    result = repository.get_job_by_id(str(job_id))
    assert result is None
    collection.find_one.assert_called_once_with({"_id": job_id})

def test_update_job_success(mocker):
    """Test successful job update."""
    collection = patch_job_collection(mocker)
    update_result = mocker.Mock(modified_count=1)
    collection.update_one.return_value = update_result
    job_id = ObjectId()
    job_data = {"title": "Senior Software Engineer", "salary_range": "$100,000 - $140,000"}
    result = repository.update_job(str(job_id), job_data)
    assert result.modified_count == 1
    collection.update_one.assert_called_once_with({"_id": job_id}, {"$set": job_data})

def test_get_jobs_empty_result(mocker):
    """Test getting jobs when no jobs exist."""
    collection = patch_job_collection(mocker)
    collection.count_documents.return_value = 0
    collection.find.return_value.sort.return_value.skip.return_value.limit.return_value = []
    result = repository.get_jobs(page=1, limit=10)
    assert result["jobs"] == []
    assert result["total"] == 0
    assert result["page"] == 1
    assert result["limit"] == 10
    assert result["total_pages"] == 0

def test_get_jobs_pagination_calculation(mocker):
    """Test pagination calculation with different scenarios."""
    collection = patch_job_collection(mocker)
    collection.count_documents.return_value = 25
    collection.find.return_value.sort.return_value.skip.return_value.limit.return_value = []
    result = repository.get_jobs(page=3, limit=10)
    assert result["total_pages"] == 3
    assert result["page"] == 3