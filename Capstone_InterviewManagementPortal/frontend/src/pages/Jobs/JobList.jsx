import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus, Search } from "lucide-react";
import Layout from "../../components/layout/Layout";
import JobForm from "../../components/jobs/JobForm";
import { getJobs } from "../../services/jobService";
import "./JobList.css";

const JOBS_PER_PAGE = 5;

function JobList() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState({ currentPage: 1, totalJobs: 0 });
    const [modal, setModal] = useState({ isOpen: false, mode: "create", jobData: null })
    const fetchJobs = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError("");
        try {
            const data = await getJobs({ page, limit: JOBS_PER_PAGE, search, location });
            setJobs(data.jobs || []);
            setPagination({ currentPage: page, totalJobs: data.total || 0 });
            if (data.jobs?.length) {
                setLocations(prev => [
                    ...new Set([...prev, ...data.jobs.map(j => j.location).filter(Boolean)])
                ]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [search, location]);

    useEffect(() => { fetchJobs(1); }, [fetchJobs]);

    const openCreate = () => setModal({ isOpen: true, mode: "create", jobData: null });
    const openEdit = (job) => setModal({ isOpen: true, mode: "edit", jobData: job });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));
    const handleSuccess = () => fetchJobs(pagination.currentPage);

    const totalPages = Math.ceil(pagination.totalJobs / JOBS_PER_PAGE);
    const start = (pagination.currentPage - 1) * JOBS_PER_PAGE + 1;
    const end = Math.min(pagination.currentPage * JOBS_PER_PAGE, pagination.totalJobs);

    return (
        <>
        <Layout>
            <div className="job-list-page">
                <div className="job-list-header">
                    <h2 className="job-list-title">Jobs</h2>
                    <button className="create-job-btn" onClick={openCreate}><Plus size={16} /> Create Job </button>
                </div>

                <div className="job-list-toolbar">
                    <div className="job-search-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by job title or skills..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="job-search-input"
                        />
                    </div>
                    <select
                        className="job-location-filter"
                        value={location}
                        onChange={e => setLocation(e.target.value)}>
                        <option value="">All Locations</option>
                        {locations.map(loc => ( <option key={loc} value={loc}>{loc}</option> ))}
                    </select>
                </div>
                {error && <div className="job-error">{error}</div>}
                <div className="job-table-container">
                    <table className="job-table">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Location</th>
                                <th>Experience</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="4" className="job-table-msg">Loading...</td></tr>) : jobs.length === 0 ? (
                                <tr><td colSpan="4" className="job-table-msg">No jobs found.</td></tr>) : jobs.map(job => (
                                <tr key={job.id}>
                                    <td>{job.title}</td>
                                    <td>{job.location}</td>
                                    <td>{job.experience_level}</td>
                                    <td className="job-actions-cell">
                                        <button className="job-action-btn" title="View Job"onClick={() => navigate(`/jobs/${job.id}`)}>
                                            <Eye size={16} />
                                        </button>
                                        <button className="job-action-btn" title="Edit Job"onClick={() => openEdit(job)}>
                                            <Pencil size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {pagination.totalJobs > 0 && (
                        <div className="job-pagination">
                            <span className="job-pagination-info">Showing {start} to {end} of {pagination.totalJobs} jobs</span>
                            <div className="job-pagination-controls">
                                <button
                                    className="page-btn"
                                    onClick={() => fetchJobs(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                >
                                    &#8592;
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`page-btn${pagination.currentPage === page ? " active" : ""}`}
                                        onClick={() => fetchJobs(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    className="page-btn"
                                    onClick={() => fetchJobs(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === totalPages}>
                                    &#8594;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </Layout>
        <JobForm
            mode={modal.mode}
            isOpen={modal.isOpen}
            onClose={closeModal}
            onSuccess={handleSuccess}
            jobData={modal.jobData}
        />
        </>
    );
}

export default JobList;
