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
import "./../Candidate/CandidateList.css";

function InterviewList() {
    const session = getSession();
    const navigate = useNavigate();
    const isHR = session?.role === "HR";
    const isInterviewer = session?.role === "INTERVIEWER";
    const isAdmin = session?.role === "ADMIN";
    const INTERVIEWS_PER_PAGE = 5;
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [scheduleModal, setScheduleModal] = useState(false);
    const [rescheduleInterview, setRescheduleInterview] = useState(null);
    const [feedbackModal, setFeedbackModal] = useState({ open: false, interview: null, feedback: null });
    const [activeTab, setActiveTab] = useState("all");
    const [pagination, setPagination] = useState({ currentPage: 1, total: 0 });

    const fetchInterviews = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError("");
        try {
            const status = activeTab === "completed" ? "COMPLETED" : null;
            const data = await getInterviews({ page, limit: INTERVIEWS_PER_PAGE, status });
            setInterviews(data.interviews || []);
            setPagination({ currentPage: page, total: data.total || 0 });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        // reset to page 1 when tab changes
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, [activeTab]);

    useEffect(() => {
        fetchInterviews(pagination.currentPage);
    }, [pagination.currentPage, fetchInterviews]);
    const totalPages = Math.ceil(pagination.total / INTERVIEWS_PER_PAGE);
    const start = (pagination.currentPage - 1) * INTERVIEWS_PER_PAGE + 1;
    const end = Math.min(pagination.currentPage * INTERVIEWS_PER_PAGE, pagination.total);
    const currentUserId = session?._id || session?.userId || session?.id;

    const handleViewFeedback = useCallback(async (interview) => {
        try {
            const feedback = await getFeedback(interview.id);
            setFeedbackModal({ open: true, interview, feedback });
        } catch {
            setFeedbackModal({ open: true, interview, feedback: null });
        }
    }, []);

    const canViewFeedbackForInterview = (interview) => {
        if (!interview) return false;
        const hasFeedback = interview.technical_rating != null || interview.communication_rating != null;
        if (!hasFeedback) return false;

        // HR/Admin: show as available actions (backend auth governs actual access).
        if (isHR || isAdmin) return true;

        // Interviewer: only assigned interviewer can access feedback.
        if (isInterviewer && currentUserId) {
            return interview.interviewer?.id === currentUserId || String(interview.interviewer?.id) === String(currentUserId);
        }

        return false;
    };

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
                        <>
                            <div className="iv-table-container">
                                <InterviewListTable
                                    interviews={interviews}
                                    onViewDetails={(iv) => navigate(`/interviews/${iv.id}`)}
                                    onReschedule={(iv) => canReschedule(iv) ? setRescheduleInterview(iv) : null}
                                    onViewFeedback={handleViewFeedback}
                                    canReschedule={canReschedule}
                                    canViewFeedback={canViewFeedbackForInterview}
                                    actionsDisabled={isAdmin}
                                />
                                {pagination.total > 0 && (
                                    <div className="cl-pagination">
                                        <span className="cl-pagination-info">Showing {start} to {end} of {pagination.total} interviews</span>
                                        <div className="cl-pagination-controls">
                                            <button className="page-btn" onClick={() => fetchInterviews(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>Previous</button>
                                            {totalPages <= 5
                                                ? Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                    <button key={p} className={`page-btn${pagination.currentPage === p ? " active" : ""}`} onClick={() => fetchInterviews(p)}>{p}</button>
                                                ))
                                                : [1, 2, 3, "...", totalPages].map((p, idx) =>
                                                    p === "..." ? (
                                                        <span key={`ellipsis-${idx}`} className="page-ellipsis">...</span>
                                                    ) : (
                                                        <button key={p} className={`page-btn${pagination.currentPage === p ? " active" : ""}`} onClick={() => fetchInterviews(p)}>{p}</button>
                                                    )
                                                )}
                                            <button className="page-btn" onClick={() => fetchInterviews(pagination.currentPage + 1)} disabled={pagination.currentPage === totalPages}>Next</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
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