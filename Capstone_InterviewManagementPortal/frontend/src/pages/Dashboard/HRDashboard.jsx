import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Layout from "../../components/layout/Layout";
import InterviewActions from "../../components/interview/InterviewActions";
import InterviewStatusBadge from "../../components/interview/InterviewStatusBadge";
import InterviewFormModal from "../../components/interview/InterviewFormModal";
import FeedbackDetailsModal from "../../components/interview/FeedbackDetailsModal";
import { getHRDashboard, getInterviews, getFeedback } from "../../services/interviewService";
import { getSession } from "../../utils/session";
import "../../components/interview/Interview.css";
import "./Dashboard.css";

function HRDashboard() {
    const session = getSession();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [scheduleModal, setScheduleModal] = useState(false);
    const [rescheduleInterview, setRescheduleInterview] = useState(null);
    const [feedbackModal, setFeedbackModal] = useState({ open: false, interview: null, feedback: null });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const [dashData, ivData] = await Promise.all([
                getHRDashboard(),
                getInterviews({ page: 1, limit: 5 }),
            ]);
            setStats(dashData);
            setInterviews(ivData.interviews || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleViewFeedback = async (interview) => {
        try {
            const feedback = await getFeedback(interview.id);
            setFeedbackModal({ open: true, interview, feedback });
        } catch {
            setFeedbackModal({ open: true, interview, feedback: null });
        }
    };

    const STAT_CARDS = stats ? [
        { label: "Total Jobs", value: stats.total_jobs },
        { label: "Total Candidates", value: stats.total_candidates },
        { label: "Scheduled Interviews", value: stats.scheduled_interviews },
        { label: "Selected Candidates", value: stats.selected_candidates },
        { label: "Rejected Candidates", value: stats.rejected_candidates },
    ] : [];

    return (
        <>
            <Layout>
                <div className="iv-dashboard-page">
                    <div className="iv-dashboard-header">
                        <button className="iv-schedule-btn" onClick={() => setScheduleModal(true)}>
                            <Plus size={16} /> Schedule Interview
                        </button>
                    </div>
                    {error && <div className="iv-error">{error}</div>}
                    {isLoading ? (
                        <p style={{ color: "#9ca3af" }}>Loading...</p>
                    ) : (
                        <>
                            <div className="iv-stats-grid">
                                {STAT_CARDS.map(card => (
                                    <div key={card.label} className="iv-stat-card">
                                        <span className="iv-stat-label">{card.label}</span>
                                        <span className="iv-stat-value">{card.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <div className="iv-section-header">
                                    <h3 className="iv-section-title">Recent Interviews</h3>
                                    <span className="iv-view-all" onClick={() => navigate("/interviews")}>View All</span>
                                </div>
                                <div className="iv-table-container" style={{ marginTop: "0.75rem" }}>
                                    <table className="iv-table">
                                        <thead>
                                            <tr>
                                                <th>Candidate</th>
                                                <th>Interviewer</th>
                                                <th>Job</th>
                                                <th>Date &amp; Time</th>
                                                <th>Mode</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {interviews.length === 0 ? (
                                                <tr><td colSpan="7" className="iv-table-msg">No interviews found.</td></tr>
                                            ) : interviews.map(iv => (
                                                <tr key={iv.id}>
                                                    <td>{iv.candidate?.name}</td>
                                                    <td>{iv.interviewer?.name}</td>
                                                    <td>{iv.job?.title || "N/A"}</td>
                                                    <td>{iv.interview_date} {iv.interview_time}</td>
                                                    <td>{iv.interview_mode}</td>
                                                    <td><InterviewStatusBadge status={iv.status} /></td>
                                                    <td>
                                                        <InterviewActions
                                                            interview={iv}
                                                            onViewDetails={(i) => navigate(`/interviews/${i.id}`)}
                                                            onReschedule={(i) => setRescheduleInterview(i)}
                                                            onViewFeedback={handleViewFeedback}
                                                            canReschedule={iv.status === "SCHEDULED"}
                                                        />
                                                    </td>
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

            <InterviewFormModal isOpen={scheduleModal} onClose={() => setScheduleModal(false)} onSuccess={fetchData} mode="create"/>
            <InterviewFormModal isOpen={!!rescheduleInterview} onClose={() => setRescheduleInterview(null)} onSuccess={fetchData} mode="reschedule" interview={rescheduleInterview}/>
            <FeedbackDetailsModal isOpen={feedbackModal.open} onClose={() => setFeedbackModal({ open: false, interview: null, feedback: null })} interview={feedbackModal.interview} feedback={feedbackModal.feedback}/>
        </>
    );
}

export default HRDashboard;