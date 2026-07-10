import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import InterviewStatusBadge from "../../components/interview/InterviewStatusBadge";
import { getInterviewerDashboard, getInterviews } from "../../services/interviewService";
import { getSession } from "../../utils/session";
import "../../components/interview/Interview.css";
import "./Dashboard.css";

function InterviewerDashboard() {
    const session = getSession();
    const sessionId = session?.id;
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const isFetchingRef = useRef(false);

    const fetchData = useCallback(async () => {
        if (!sessionId) {
            setIsLoading(false);
            setStats(null);
            setInterviews([]);
            return;
        }

        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;
        setIsLoading(true);
        setError("");
        try {
            const [dashData, ivData] = await Promise.all([
                getInterviewerDashboard(),
                getInterviews({ page: 1, limit: 5, status: "SCHEDULED" }),
            ]);
            setStats(dashData);
            setInterviews(ivData.interviews || []);
        } catch (err) {
            setError(err.message || "Unable to load your dashboard right now.");
        } finally {
            isFetchingRef.current = false;
            setIsLoading(false);
        }
    }, [sessionId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const STAT_CARDS = stats ? [
        { label: "Assigned Interviews", value: stats.assigned_interviews },
        { label: "Pending Feedback", value: stats.pending_feedback },
        { label: "Submitted Feedback", value: stats.completed_feedback },
    ] : [];

    return (
        <Layout>
            <div className="iv-dashboard-page">
                {error && <div className="iv-error">{error}</div>}
                {isLoading ? (
                    <p style={{ color: "#9ca3af" }}>Loading...</p>
                ) : (
                    <>
                        <div className="iv-stats-grid iv-stats-grid--3">
                            {STAT_CARDS.map(card => (
                                <div key={card.label} className="iv-stat-card">
                                    <span className="iv-stat-label">{card.label}</span>
                                    <span className="iv-stat-value">{card.value}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div className="iv-section-header">
                                <h3 className="iv-section-title">Upcoming Interviews</h3>
                                <span className="iv-view-all" onClick={() => navigate("/interviews")}>View All</span>
                            </div>
                            <div className="iv-table-container" style={{ marginTop: "0.75rem" }}>
                                <table className="iv-table">
                                    <thead>
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Job</th>
                                            <th>Date &amp; Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {interviews.length === 0 ? (
                                            <tr><td colSpan="4" className="iv-table-msg">No upcoming interviews.</td></tr>
                                        ) : interviews.map(iv => (
                                            <tr key={iv.id}>
                                                <td>{iv.candidate?.name}</td>
                                                <td>{iv.job?.title || "N/A"}</td>
                                                <td>{iv.interview_date} {iv.interview_time}</td>
                                                <td><InterviewStatusBadge status={iv.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

export default InterviewerDashboard;