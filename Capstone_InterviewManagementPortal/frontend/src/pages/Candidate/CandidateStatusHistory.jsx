import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { getCandidateById, getStatusHistory } from "../../services/candidateService";
import "./CandidateStatusHistory.css";

function StatusTimeline({ entries }) {
    if (!entries || entries.length === 0) {
        return <div className="csh-empty">No status history available.</div>;
    }
    return (
        <div className="csh-timeline">
            {entries.map((entry, idx) => (
                <div key={idx} className="csh-timeline-item">
                    <div className="csh-timeline-dot" />
                    {idx < entries.length - 1 && <div className="csh-timeline-line" />}
                    <div className="csh-timeline-content">
                        <div className="csh-timeline-header">
                            <span className={`csh-status-badge csh-status--${entry.new_status.toLowerCase()}`}>
                                {entry.new_status}
                            </span>
                            <span className="csh-timeline-date">
                                {new Date(entry.updated_at).toLocaleString()}
                            </span>
                        </div>
                        {entry.previous_status && (
                            <p className="csh-timeline-meta">
                                From: <span className="csh-prev-status">{entry.previous_status}</span>
                            </p>
                        )}
                        {entry.updated_by && (
                            <p className="csh-timeline-meta">Updated by: {entry.updated_by}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function CandidateStatusHistory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setError("");
            try {
                const [candidateData, historyData] = await Promise.all([
                    getCandidateById(id),
                    getStatusHistory(id),
                ]);
                setCandidate(candidateData);
                setHistory(historyData.status_history || []);
            } catch (err) {
                setError(err.message || "Failed to load status history.");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    return (
        <Layout>
            <div className="csh-page">
                <div className="csh-breadcrumb">
                    <span className="csh-breadcrumb-link" onClick={() => navigate("/candidates")}>Candidates</span>
                    <ChevronRight size={14} className="csh-breadcrumb-sep" />
                    <span className="csh-breadcrumb-link" onClick={() => navigate(`/candidates/${id}`)}>Candidate Details</span>
                    <ChevronRight size={14} className="csh-breadcrumb-sep" />
                    <span className="csh-breadcrumb-current">Status History</span>
                </div>
                <h2 className="csh-title">Status History</h2>
                <p className="csh-subtitle">Track all status changes for this candidate</p>

                {isLoading && <div className="csh-state">Loading...</div>}
                {error && <div className="csh-state error">{error}</div>}

                {!isLoading && !error && candidate && (
                    <>
                        <div className="csh-card">
                            <div className="csh-row">
                                <span className="csh-label">Candidate</span>
                                <span className="csh-value">{candidate.first_name} {candidate.last_name}</span>
                            </div>
                            <div className="csh-row">
                                <span className="csh-label">Email</span>
                                <span className="csh-value">{candidate.email}</span>
                            </div>
                            <div className="csh-row">
                                <span className="csh-label">Current Status</span>
                                <span className={`csh-status-badge csh-status--${candidate.status.toLowerCase()}`}>
                                    {candidate.status}
                                </span>
                            </div>
                        </div>

                        <h3 className="csh-section-title">Timeline</h3>
                        <StatusTimeline entries={history} />
                    </>
                )}

                <button className="csh-back-btn" onClick={() => navigate(`/candidates/${id}`)}>
                    ← Back to Candidate Details
                </button>
            </div>
        </Layout>
    );
}

export default CandidateStatusHistory;
