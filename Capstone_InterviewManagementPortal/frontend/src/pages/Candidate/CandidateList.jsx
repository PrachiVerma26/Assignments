import { useState, useEffect, useCallback, useRef } from "react";
import { getSession } from "../../utils/session";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { MoreVertical, Plus, Search } from "lucide-react";
import Layout from "../../components/layout/Layout";
import CandidateStatusHistory from "../../components/candidate/CandidateStatusHistory";
import { getCandidates } from "../../services/candidateService";
import useDebounce from "../../utils/useDebounce";
import "./CandidateList.css";
import {CANDIDATES_PER_PAGE, STATUS_LABELS} from "../../constants/candidateConstants";
import ActionsMenu from "../../components/actions/ActionsMenu";

function CandidateList() {
    const session = getSession();
    const isAdmin = session?.role === "ADMIN";
    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [pagination, setPagination] = useState({ currentPage: 1, total: 0 });
    const [historyCandidate, setHistoryCandidate] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            const timer = setTimeout(() => setSuccessMessage(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const debouncedSearch = useDebounce(search, 400);

    const fetchCandidates = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError("");
        try {
            const data = await getCandidates({ page, limit: CANDIDATES_PER_PAGE, search: debouncedSearch });
            setCandidates(data.candidates || []);
            setPagination({ currentPage: page, total: data.total || 0 });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => { fetchCandidates(1); }, [fetchCandidates]);

    const totalPages = Math.ceil(pagination.total / CANDIDATES_PER_PAGE);
    const start = (pagination.currentPage - 1) * CANDIDATES_PER_PAGE + 1;
    const end = Math.min(pagination.currentPage * CANDIDATES_PER_PAGE, pagination.total);

    const getPageNumbers = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages = [1, 2, 3];
        if (!pages.includes(totalPages)) pages.push("...", totalPages);
        return pages;
    };

    const formatExperience = (years, months) => {
        if (years === 0 && months === 0) return "0 months";
        if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
        if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
        return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    };

    return (
        <Layout>
            <div className="cl-page">
                <div className="cl-header">
                    <h2 className="cl-title">Candidates</h2>
                    {!isAdmin && (
                        <button className="cl-add-btn" onClick={() => navigate("/candidates/create")}>
                            <Plus size={16} /> Add Candidate</button>
                    )}
                </div>
                <div className="cl-toolbar">
                    <div className="cl-search-box">
                        <Search size={16} className="cl-search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="cl-search-input"
                        />
                    </div>
                </div>
                {successMessage && <div className="cl-success">{successMessage}</div>}
                {error && <div className="cl-error">{error}</div>}
                <div className="cl-table-container">
                    <table className="cl-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Applied Job</th>
                                <th>Experience</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="8" className="cl-table-msg">Loading...</td></tr>
                            ) : candidates.length === 0 ? (
                                <tr><td colSpan="8" className="cl-table-msg">No candidates found.</td></tr>
                            ) : candidates.map((c, idx) => (
                                <tr key={c.id}>
                                    <td>{(pagination.currentPage - 1) * CANDIDATES_PER_PAGE + idx + 1}</td>
                                    <td>{c.first_name} {c.last_name}</td>
                                    <td>{c.email}</td>
                                    <td>{c.mobile}</td>
                                    <td>{c.applied_job?.title || "N/A"}</td>
                                    <td>{formatExperience(c.experience_years, c.experience_months)}</td>
                                    <td>
                                        <span className={`cl-status cl-status--${c.status.toLowerCase()}`}>{STATUS_LABELS[c.status] || c.status}</span>
                                    </td>
                                    <td className="cl-actions-cell">
                                        <ActionsMenu
                                            items={[
                                                {label: "View", onClick: () => navigate(`/candidates/${c.id}`), disabled: isAdmin,},
                                                {label: "Edit", onClick: () => navigate(`/candidates/${c.id}/edit`), disabled: isAdmin,},
                                                {label: "Status History",onClick: () => setHistoryCandidate(c), disabled: isAdmin,},
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pagination.total > 0 && (
                        <div className="cl-pagination">
                            <span className="cl-pagination-info">Showing {start} to {end} of {pagination.total} candidates</span>
                            <div className="cl-pagination-controls">
                                <button className="page-btn" onClick={() => fetchCandidates(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>Previous</button>
                                {getPageNumbers().map((p, i) =>
                                    p === "..." ? (
                                        <span key={`ellipsis-${i}`} className="page-ellipsis">...</span>
                                    ) : (
                                        <button key={p} className={`page-btn${pagination.currentPage === p ? " active" : ""}`} onClick={() => fetchCandidates(p)}>{p}</button>
                                    )
                                )}
                                <button className="page-btn" onClick={() => fetchCandidates(pagination.currentPage + 1)} disabled={pagination.currentPage === totalPages}>Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {!isAdmin && historyCandidate && (
                <CandidateStatusHistory
                    candidateId={historyCandidate.id}
                    candidateName={`${historyCandidate.first_name} ${historyCandidate.last_name}`}
                    onClose={() => setHistoryCandidate(null)}
                />
            )}
        </Layout>
    );
}

export default CandidateList;