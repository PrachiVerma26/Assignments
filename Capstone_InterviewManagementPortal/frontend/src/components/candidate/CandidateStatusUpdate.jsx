import { useState } from "react";
import { updateCandidateStatus } from "../../services/candidateService";
import "./CandidateStatusUpdate.css";

const STATUS_OPTIONS = [
    { value: "PROFILE_CREATED", label: "Profile Created" },
    { value: "APPLIED", label: "Applied" },
    { value: "SHORTLISTED", label: "Shortlisted" },
    { value: "REJECTED", label: "Rejected" },
    { value: "HIRED", label: "Hired" },
];

function CandidateStatusUpdate({ candidateId, currentStatus, onStatusUpdated }) {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus || "");
    const [statusError, setStatusError] = useState("");
    const [apiError, setApiError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        setSuccessMsg("");
        if (!selectedStatus) { setStatusError("Status is required."); return; }
        setIsSubmitting(true);
        try {
            await updateCandidateStatus(candidateId, selectedStatus);
            setSuccessMsg("Status updated successfully.");
            if (onStatusUpdated) onStatusUpdated(selectedStatus);
        } catch (err) {
            setApiError(err.message || "Failed to update status. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="csu-component">
            {apiError && <div className="csu-api-error">{apiError}</div>}
            {successMsg && <div className="csu-success">{successMsg}</div>}
            <form className="csu-form" onSubmit={handleSubmit} noValidate>
                <div className="csu-group">
                    <label className="cf-label">New Status <span className="cf-req">*</span></label>
                    <select
                        className={`csu-select${statusError ? " error" : ""}`}
                        value={selectedStatus}
                        onChange={e => { setSelectedStatus(e.target.value); setStatusError(""); setApiError(""); setSuccessMsg(""); }}
                        disabled={isSubmitting}
                    >
                        <option value="">Select status...</option>
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {statusError && <p className="cf-error-msg">{statusError}</p>}
                </div>
                <div className="csu-actions">
                    <button type="submit" className="cf-submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Status"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CandidateStatusUpdate;
