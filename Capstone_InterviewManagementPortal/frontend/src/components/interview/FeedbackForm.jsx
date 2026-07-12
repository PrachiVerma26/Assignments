import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { submitFeedback } from "../../services/interviewService";

const EMPTY_FORM = { technical_rating: "", communication_rating: "", recommendation: "", comments: "" };

function FeedbackForm({ isOpen, onClose, onSuccess, interview }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setForm(EMPTY_FORM);
        setErrors({});
        setApiError("");
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const validate = () => {
        const e = {};
        if (!form.technical_rating) e.technical_rating = "Technical rating is required.";
        if (!form.communication_rating) e.communication_rating = "Communication rating is required.";
        if (!form.recommendation) e.recommendation = "Recommendation is required.";
        if (!form.comments.trim()) e.comments = "Comments are required.";
        return e;
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
        if (apiError) setApiError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
        setIsLoading(true);
        setApiError("");
        try {
            await submitFeedback(interview.id, {
                technical_rating: parseInt(form.technical_rating),
                communication_rating: parseInt(form.communication_rating),
                recommendation: form.recommendation,
                comments: form.comments.trim(),
            });
            onSuccess();
            onClose();
        } catch (err) {
            setApiError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const ratingOptions = [1, 2, 3, 4, 5];

    return (
        <div className="jf-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="jf-modal">
                <div className="jf-header">
                    <h2 className="jf-title">Submit Feedback</h2>
                    <button className="jf-close" onClick={onClose}><X size={18} /></button>
                </div>
                <form className="jf-form" onSubmit={handleSubmit} noValidate>
                    {apiError && <div className="jf-api-error">{apiError}</div>}

                    <div className="jf-row">
                        <div className="jf-group">
                            <label className="jf-label">Technical Rating (1–5) <span className="jf-req">*</span></label>
                            <select className={`jf-input${errors.technical_rating ? " error" : ""}`} value={form.technical_rating} onChange={e => handleChange("technical_rating", e.target.value)} disabled={isLoading}>
                                <option value="">Select rating</option>
                                {ratingOptions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {errors.technical_rating && <p className="jf-error-msg">{errors.technical_rating}</p>}
                        </div>
                        <div className="jf-group">
                            <label className="jf-label">Communication Rating (1–5) <span className="jf-req">*</span></label>
                            <select className={`jf-input${errors.communication_rating ? " error" : ""}`} value={form.communication_rating} onChange={e => handleChange("communication_rating", e.target.value)} disabled={isLoading}>
                                <option value="">Select rating</option>
                                {ratingOptions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {errors.communication_rating && <p className="jf-error-msg">{errors.communication_rating}</p>}
                        </div>
                    </div>

                    <div className="jf-group">
                        <label className="jf-label">Recommendation <span className="jf-req">*</span></label>
                        <select className={`jf-input${errors.recommendation ? " error" : ""}`} value={form.recommendation} onChange={e => handleChange("recommendation", e.target.value)} disabled={isLoading}>
                            <option value="">Select recommendation</option>
                            <option value="SELECT">Select</option>
                            <option value="REJECT">Reject</option>
                            <option value="HOLD">Hold</option>
                        </select>
                        {errors.recommendation && <p className="jf-error-msg">{errors.recommendation}</p>}
                    </div>

                    <div className="jf-group">
                        <label className="jf-label">Comments <span className="jf-req">*</span></label>
                        <textarea className={`jf-textarea${errors.comments ? " error" : ""}`} rows={4} placeholder="Enter your feedback..." value={form.comments} onChange={e => handleChange("comments", e.target.value)} disabled={isLoading} />
                        {errors.comments && <p className="jf-error-msg">{errors.comments}</p>}
                    </div>

                    <div className="jf-actions">
                        <button type="button" className="jf-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
                        <button type="submit" className="jf-submit" disabled={isLoading}>{isLoading ? "Submitting..." : "Submit Feedback"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FeedbackForm;