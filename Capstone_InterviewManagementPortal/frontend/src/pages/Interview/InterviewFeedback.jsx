import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import InterviewStatusBadge from "../../components/interview/InterviewStatusBadge";
import FeedbackForm from "../../components/interview/FeedbackForm";
import FeedbackDetailsModal from "../../components/interview/FeedbackDetailsModal";
import { getInterviews, getFeedback } from "../../services/interviewService";
import "../../components/interview/Interview.css";

function InterviewFeedback() {
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("assigned");
    const [feedbackModal, setFeedbackModal] = useState({ open: false, interview: null });
    const [viewFeedbackModal, setViewFeedbackModal] = useState({ open: false, interview: null, feedback: null });

    const fetchInterviews = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await getInterviews({ page: 1, limit: 100 });
            setInterviews(data.interviews || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchInterviews(); }, [fetchInterviews]);

    const assigned = interviews.filter(iv => iv.status === "SCHEDULED");
    const completed = interviews.filter(iv => iv.status === "COMPLETED");



    const handleFeedbackSuccess = () => {
        setFeedbackModal({ open: false, interview: null });
        fetchInterviews();
    };

    const handleViewFeedback = async (interview) => {
        try {
            const feedback = await getFeedback(interview.id);
            setViewFeedbackModal({ open: true, interview, feedback });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <Layout>
                <div className="iv-page">
                    <div className="iv-header">
                        <h2 className="iv-title">Interviews</h2>
                    </div>
                    {error && <div className="iv-error">{error}</div>}
                    <div className="iv-tabs">
                        <button className={`iv-tab${activeTab === "assigned" ? " active" : ""}`} onClick={() => setActiveTab("assigned")}>Assigned Interviews</button>
                        <button className={`iv-tab${activeTab === "completed" ? " active" : ""}`} onClick={() => setActiveTab("completed")}>Completed Interviews</button>
                    </div>
                    {isLoading ? (
                        <div className="iv-table-container"><p className="iv-table-msg">Loading...</p></div>
                    ) : activeTab === "assigned" ? (
                        <div className="iv-table-container">
                            <table className="iv-table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job</th>
                                        <th>Date &amp; Time</th>
                                        <th>Mode</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assigned.length === 0 ? (
                                        <tr><td colSpan="6" className="iv-table-msg">No assigned interviews.</td></tr>
                                    ) : assigned.map(iv => (
                                        <tr key={iv.id}>
                                            <td>{iv.candidate?.name}</td>
                                            <td>{iv.job?.title || "N/A"}</td>
                                            <td>{iv.interview_date} {iv.interview_time}</td>
                                            <td>{iv.interview_mode}</td>
                                            <td><InterviewStatusBadge status={iv.status} /></td>
                                            <td>
                                                <button 
                                                    className="iv-submit-btn" 
                                                    onClick={() => setFeedbackModal({ open: true, interview: iv })}
                                                >
                                                    Submit Feedback
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="iv-table-container">
                            <table className="iv-table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completed.length === 0 ? (
                                        <tr><td colSpan="5" className="iv-table-msg">No completed interviews.</td></tr>
                                    ) : completed.map(iv => (
                                        <tr key={iv.id}>
                                            <td>{iv.candidate?.name}</td>
                                            <td>{iv.job?.title || "N/A"}</td>
                                            <td>{iv.interview_date}</td>
                                            <td><InterviewStatusBadge status={iv.status} /></td>
                                            <td>
                                                <button className="iv-view-feedback-btn" onClick={() => handleViewFeedback(iv)}>
                                                    View Feedback
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Layout>
            <FeedbackForm isOpen={feedbackModal.open} onClose={() => setFeedbackModal({ open: false, interview: null })} onSuccess={handleFeedbackSuccess} interview={feedbackModal.interview}/>
            <FeedbackDetailsModal isOpen={viewFeedbackModal.open} onClose={() => setViewFeedbackModal({ open: false, interview: null, feedback: null })} interview={viewFeedbackModal.interview} feedback={viewFeedbackModal.feedback}/>
        </>
    );
}

export default InterviewFeedback;