import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Layout from "../../components/layout/Layout";
import InterviewListTable from "../../components/interview/InterviewListTable";
import EmptyInterviewState from "../../components/interview/EmptyInterviewState";
import InterviewFormModal from "../../components/interview/InterviewFormModal";
import FeedbackDetailsModal from "../../components/interview/FeedbackDetailsModal";
import { getInterviews, getFeedback } from "../../services/interviewService";
import { getSession } from "../../utils/session";
import "../../components/interview/Interview.css";

function InterviewList() {
    const session = getSession();
    const navigate = useNavigate();
    const isHR = session?.role === "HR";
    const isInterviewer = session?.role === "INTERVIEWER";
    const isAdmin = session?.role === "ADMIN";
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [scheduleModal, setScheduleModal] = useState(false);
    const [rescheduleInterview, setRescheduleInterview] = useState(null);
    const [feedbackModal, setFeedbackModal] = useState({ open: false, interview: null, feedback: null });
    const [activeTab, setActiveTab] = useState("all");

    const fetchInterviews = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const status = activeTab === "completed" ? "COMPLETED" : null;
            const data = await getInterviews({ page: 1, limit: 100, status });
            setInterviews(data.interviews || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { 
        fetchInterviews(); 
    }, [fetchInterviews]);

    const handleViewFeedback = useCallback(async (interview) => {
        try {
            const feedback = await getFeedback(interview.id);
            setFeedbackModal({ open: true, interview, feedback });
        } catch {
            setFeedbackModal({ open: true, interview, feedback: null });
        }
    }, []);

    const canReschedule = (interview) => {
        return interview.status === "SCHEDULED";
    };

    return (
        <>
            <Layout>
                <div className="iv-page">
                    <div className="iv-header">
                        <h2 className="iv-title">Interviews</h2>
                        {isHR && (
                            <button className="iv-schedule-btn" onClick={() => setScheduleModal(true)}>
                                <Plus size={16} /> Schedule Interview
                            </button>
                        )}
                    </div>
                    {error && <div className="iv-error">{error}</div>}
                    
                    {isInterviewer && (
                        <div className="iv-tabs">
                            <button className={`iv-tab${activeTab === "all" ? " active" : ""}`} onClick={() => setActiveTab("all")}>Assigned Interviews</button>
                            <button className={`iv-tab${activeTab === "completed" ? " active" : ""}`} onClick={() => setActiveTab("completed")}>Completed Interviews</button>
                        </div>
                    )}
                    
                    {isLoading ? (
                        <div className="iv-table-container"><p className="iv-table-msg">Loading...</p></div>
                    ) : interviews.length === 0 ? (
                        <EmptyInterviewState />
                    ) : (
                        <InterviewListTable
                            interviews={interviews}
                            onViewDetails={(iv) => navigate(`/interviews/${iv.id}`)}
                            onReschedule={(iv) => canReschedule(iv) ? setRescheduleInterview(iv) : null}
                            onViewFeedback={handleViewFeedback}
                            canReschedule={canReschedule}
                            actionsDisabled={isAdmin}
                        />
                    )}
                </div>
            </Layout>

            {isHR && (
                <InterviewFormModal isOpen={scheduleModal} onClose={() => setScheduleModal(false)} onSuccess={fetchInterviews} mode="create"/>
            )}
            <InterviewFormModal isOpen={!!rescheduleInterview} onClose={() => setRescheduleInterview(null)} onSuccess={fetchInterviews} mode="reschedule" interview={rescheduleInterview}/>
            <FeedbackDetailsModal isOpen={feedbackModal.open} onClose={() => setFeedbackModal({ open: false, interview: null, feedback: null })} interview={feedbackModal.interview} feedback={feedbackModal.feedback}/>
        </>
    );
}

export default InterviewList;