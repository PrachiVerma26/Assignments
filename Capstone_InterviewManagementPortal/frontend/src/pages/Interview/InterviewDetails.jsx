import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../../components/layout/Layout";
import InterviewStatusBadge from "../../components/interview/InterviewStatusBadge";
import InterviewFormModal from "../../components/interview/InterviewFormModal";
import FeedbackForm from "../../components/interview/FeedbackForm";
import FeedbackDetailsModal from "../../components/interview/FeedbackDetailsModal";
import { getInterviewById, getFeedback } from "../../services/interviewService";
import { getSession } from "../../utils/session";
import "../../components/interview/Interview.css";

function InterviewDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const session = getSession();
    const isInterviewer = session?.role === "INTERVIEWER";
    
    const [interview, setInterview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState(false);
    const [viewFeedbackModal, setViewFeedbackModal] = useState({ open: false, feedback: null });

    const fetchInterview = async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await getInterviewById(id);
            setInterview(data.interview);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchInterview(); }, [id]);

    const isCompleted = interview?.status === "COMPLETED";
    const canReschedule = interview && !isCompleted && interview.status === "SCHEDULED";

    const canSubmitFeedback = (iv) => {
        if (!iv || isCompleted) return false;
        const interviewDateTime = new Date(`${iv.interview_date}T${iv.interview_time}`);
        return new Date() >= interviewDateTime;
    };

    const handleViewFeedback = async () => {
        try {
            const feedback = await getFeedback(id);
            setViewFeedbackModal({ open: true, feedback });
        } catch (err) {
            setError(err.message);
        }
    };

    const renderRow = (label, value) => value != null && (
        <div className="iv-detail-row">
            <span className="iv-detail-label">{label}</span>
            <span className="iv-detail-value">{value}</span>
        </div>
    );

    return (
        <>
            <Layout>
                <div className="iv-page">
                    <div className="iv-breadcrumb">
                        <span className="iv-breadcrumb-link" onClick={() => navigate("/interviews")}>Interviews</span>
                        <ChevronRight size={14} className="iv-breadcrumb-sep" />
                        <span>Interview Details</span>
                    </div>

                    {isLoading && <div className="iv-table-container"><p className="iv-table-msg">Loading...</p></div>}
                    {error && <div className="iv-error">{error}</div>}

                    {interview && (
                        <div className="iv-detail-card">
                            <div className="iv-detail-header">
                                <h3 className="iv-detail-title">Interview Details</h3>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    {canReschedule && (
                                        <button className="iv-reschedule-btn" onClick={() => setRescheduleOpen(true)}>Reschedule</button>
                                    )}
                                    {isInterviewer && isCompleted && (
                                        <button className="iv-view-feedback-btn" onClick={handleViewFeedback}>View Feedback</button>
                                    )}
                                    {isInterviewer && !isCompleted && (
                                        <button
                                            className="iv-submit-btn"
                                            onClick={() => setFeedbackModal(true)}
                                            disabled={!canSubmitFeedback(interview)}
                                            title={!canSubmitFeedback(interview) ? "Feedback can be submitted after interview time" : ""}>
                                            Submit Feedback
                                        </button>
                                    )}
                                </div>
                            </div>
                            {renderRow("Candidate", interview.candidate?.name)}
                            {renderRow("Interviewer", interview.interviewer?.name)}
                            {renderRow("Interview Date", interview.interview_date)}
                            {renderRow("Interview Time", interview.interview_time)}
                            {renderRow("Interview Mode", interview.interview_mode)}
                            {renderRow("Meeting Link", interview.meeting_link)}
                            {renderRow("Location", interview.location)}
                            <div className="iv-detail-row">
                                <span className="iv-detail-label">Status</span>
                                <span className="iv-detail-value"><InterviewStatusBadge status={interview.status} /></span>
                            </div>
                            {renderRow("Created On", new Date(interview.created_at).toLocaleString())}
                        </div>
                    )}
                    <button className="iv-back-btn" onClick={() => navigate("/interviews")}>← Back to Interviews</button>
                </div>
            </Layout>

            <InterviewFormModal isOpen={rescheduleOpen} onClose={() => setRescheduleOpen(false)} onSuccess={() => { setRescheduleOpen(false); fetchInterview(); }} mode="reschedule" interview={interview}/>
            {isInterviewer && (
                <FeedbackForm isOpen={feedbackModal} onClose={() => setFeedbackModal(false)} onSuccess={() => { setFeedbackModal(false); fetchInterview(); }} interview={interview}/>
            )}
            <FeedbackDetailsModal isOpen={viewFeedbackModal.open} onClose={() => setViewFeedbackModal({ open: false, feedback: null })} interview={interview} feedback={viewFeedbackModal.feedback}/>
        </>
    );
}

export default InterviewDetails;