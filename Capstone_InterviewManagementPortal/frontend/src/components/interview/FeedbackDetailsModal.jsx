import { X } from "lucide-react";

const RECOMMENDATION_BADGE = {
    SELECT: { cls: "iv-recommendation-badge--recommended", label: "Select" },
    REJECT: { cls: "iv-recommendation-badge--not", label: "Reject" },
    HOLD: { cls: "iv-recommendation-badge--strongly", label: "Hold" },
};

function FeedbackDetailsModal({ isOpen, onClose, interview, feedback }) {
    if (!isOpen) return null;
    const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);
    const rec = feedback?.recommendation ? RECOMMENDATION_BADGE[feedback.recommendation] : null;

    return (
        <div className="jf-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="jf-modal">
                <div className="jf-header">
                    <h2 className="jf-title">Feedback Details</h2>
                    <button className="jf-close" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="iv-feedback-body">
                    {!feedback ? (
                        <p style={{ color: "#9ca3af", textAlign: "center" }}>No feedback submitted for this interview.</p>
                    ) : (
                        <>
                            <div className="iv-feedback-section">
                                <h3 className="iv-feedback-section-title">Candidate Information</h3>
                                <div className="iv-detail-row"><span className="iv-detail-label">Candidate</span><span className="iv-detail-value">{interview?.candidate?.name}</span></div>
                                <div className="iv-detail-row"><span className="iv-detail-label">Interviewer</span><span className="iv-detail-value">{interview?.interviewer?.name}</span></div>
                                <div className="iv-detail-row"><span className="iv-detail-label">Interview Date</span><span className="iv-detail-value">{interview?.interview_date}</span></div>
                            </div>
                            <div className="iv-feedback-section">
                                <h3 className="iv-feedback-section-title">Feedback</h3>
                                <div className="iv-detail-row">
                                    <span className="iv-detail-label">Technical Rating</span>
                                    <span className="iv-detail-value iv-stars">{renderStars(feedback.technical_rating)}</span>
                                </div>
                                <div className="iv-detail-row">
                                    <span className="iv-detail-label">Communication Rating</span>
                                    <span className="iv-detail-value iv-stars">{renderStars(feedback.communication_rating)}</span>
                                </div>
                                <div className="iv-detail-row">
                                    <span className="iv-detail-label">Recommendation</span>
                                    {rec ? (
                                        <span className={`iv-recommendation-badge ${rec.cls}`}>{rec.label}</span>
                                    ) : (
                                        <span className="iv-detail-value">{feedback.recommendation}</span>
                                    )}
                                </div>
                                <div className="iv-detail-row">
                                    <span className="iv-detail-label">Comments</span>
                                    <span className="iv-detail-value iv-comments">{feedback.comments}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FeedbackDetailsModal;