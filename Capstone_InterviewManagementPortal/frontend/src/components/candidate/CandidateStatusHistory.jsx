import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getCandidateStatusHistory } from "../../services/candidateService";
import "./CandidateStatusHistory.css";

const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

const getStatusClass = (status) =>
    status.toLowerCase().replace(/\s+/g, "_");

function CandidateStatusHistory({ candidateId, candidateName, onClose }) {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setError("");
            try {
                const data = await getCandidateStatusHistory(candidateId);
                setHistory(data.status_history || []);
            } catch (err) {
                setError(err.message || "Failed to load status history.");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [candidateId]);

    return (
        <div className="csh-overlay" onClick={onClose}>
            <div className="csh-modal" onClick={e => e.stopPropagation()}>
                <div className="csh-modal-header">
                    <div>
                        <h3 className="csh-modal-title">Status History</h3>
                        {candidateName && <p className="csh-modal-subtitle"><strong>Candidate Name: </strong>{candidateName}</p>}
                    </div>
                    <button className="csh-close-btn" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="csh-modal-body">
                    {isLoading && <div className="csh-state">Loading...</div>}
                    {error && <div className="csh-state error">{error}</div>}
                    {!isLoading && !error && history.length === 0 && (
                        <div className="csh-empty">No status history available.</div>
                    )}
                    {!isLoading && !error && history.length > 0 && (
                        <div className="csh-timeline">
                            {history.map((entry, idx) => (
                                <div key={idx} className="csh-timeline-item">
                                    <div className={`csh-timeline-dot csh-dot--${getStatusClass( entry.new_status)}`}/>
                                    {idx < history.length - 1 && <div className="csh-timeline-line" />}
                                    <div className="csh-timeline-content">
                                        <div className="csh-timeline-header">
                                            <span className={`csh-status-badge csh-status--${entry.new_status.toLowerCase()}`}>
                                                {entry.new_status}
                                            </span>
                                            <span className="csh-timeline-date">
                                                {formatDateTime(entry.updated_at)}
                                            </span>
                                        </div>
                                        {entry.previous_status && (
                                            <p className="csh-timeline-meta">
                                                <strong>From:</strong>{" "} <span className="csh-prev-status">{entry.previous_status.replaceAll("_"," ")}</span>
                                            </p>
                                        )}
                                        {entry.updated_by && (
                                            <p className="csh-timeline-meta"><strong>Updated by:</strong> {entry.updated_by}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CandidateStatusHistory;