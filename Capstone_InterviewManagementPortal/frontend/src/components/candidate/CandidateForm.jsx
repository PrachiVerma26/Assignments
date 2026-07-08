import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createCandidate, updateCandidate } from "../../services/candidateService";
import ResumeUpload from "./ResumeUpload";
import "./CandidateForm.css";

const EMPTY_FORM = {
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    current_company: "",
    total_experience: "",
    applied_job_id: "",
};

function CandidateForm({ mode, candidateData }) {
    const navigate = useNavigate();
    const isEdit = mode === "edit";
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [savedCandidateId, setSavedCandidateId] = useState(null);

    useEffect(() => {
        if (isEdit && candidateData) {
            setFormData({
                first_name: candidateData.first_name || "",
                last_name: candidateData.last_name || "",
                email: candidateData.email || "",
                mobile: candidateData.mobile || "",
                current_company: candidateData.current_company || "",
                total_experience: candidateData.total_experience ?? "",
                applied_job_id: candidateData.applied_job_id || "",
            });
            setSavedCandidateId(candidateData.id);
        }
    }, [isEdit, candidateData]);

    const validate = (data) => {
        const e = {};
        if (!data.first_name.trim())       e.first_name = "First name is required.";
        if (!data.last_name.trim())        e.last_name = "Last name is required.";
        if (!data.email.trim())            e.email = "Email is required.";
        if (!data.mobile.trim())           e.mobile = "Phone number is required.";
        if (!data.current_company.trim())  e.current_company = "Current company is required.";
        if (data.total_experience === "" || data.total_experience === null) e.total_experience = "Total experience is required.";
        if (!data.applied_job_id.trim())   e.applied_job_id = "Applied job ID is required.";
        return e;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (apiError) setApiError("");
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        setIsLoading(true);
        setApiError("");
        try {
            const payload = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                mobile: formData.mobile.trim(),
                current_company: formData.current_company.trim(),
                total_experience: parseFloat(formData.total_experience),
                applied_job_id: formData.applied_job_id.trim(),
            };
            if (isEdit) {
                await updateCandidate(candidateData.id, payload);
                navigate("/candidates");
            } else {
                const created = await createCandidate(payload);
                setSavedCandidateId(created.id);
            }
        } catch (err) {
            setApiError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cf-page">
            <h2 className="cf-title">{isEdit ? "Edit Candidate" : "Add Candidate"}</h2>
            <p className="cf-subtitle">{isEdit ? "Update candidate profile details" : "Fill in the details to register a new candidate"}</p>

            <div className="cf-card">
                <form className="cf-form" onSubmit={handleSubmit} noValidate>
                    {apiError && <div className="cf-api-error">{apiError}</div>}

                    <div className="cf-row">
                        <div className="cf-group">
                            <label className="cf-label">First Name <span className="cf-req">*</span></label>
                            <input
                                className={`cf-input${errors.first_name ? " error" : ""}`}
                                placeholder="e.g. John"
                                value={formData.first_name}
                                onChange={e => handleChange("first_name", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.first_name && <p className="cf-error-msg">{errors.first_name}</p>}
                        </div>
                        <div className="cf-group">
                            <label className="cf-label">Last Name <span className="cf-req">*</span></label>
                            <input
                                className={`cf-input${errors.last_name ? " error" : ""}`}
                                placeholder="e.g. Doe"
                                value={formData.last_name}
                                onChange={e => handleChange("last_name", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.last_name && <p className="cf-error-msg">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div className="cf-row">
                        <div className="cf-group">
                            <label className="cf-label">Email <span className="cf-req">*</span></label>
                            <input
                                type="email"
                                className={`cf-input${errors.email ? " error" : ""}`}
                                placeholder="e.g. john@nucleusteq.com"
                                value={formData.email}
                                onChange={e => handleChange("email", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.email && <p className="cf-error-msg">{errors.email}</p>}
                        </div>
                        <div className="cf-group">
                            <label className="cf-label">Phone <span className="cf-req">*</span></label>
                            <input
                                className={`cf-input${errors.mobile ? " error" : ""}`}
                                placeholder="e.g. 9876543210"
                                value={formData.mobile}
                                onChange={e => handleChange("mobile", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.mobile && <p className="cf-error-msg">{errors.mobile}</p>}
                        </div>
                    </div>

                    <div className="cf-row">
                        <div className="cf-group">
                            <label className="cf-label">Current Company <span className="cf-req">*</span></label>
                            <input
                                className={`cf-input${errors.current_company ? " error" : ""}`}
                                placeholder="e.g. Infosys"
                                value={formData.current_company}
                                onChange={e => handleChange("current_company", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.current_company && <p className="cf-error-msg">{errors.current_company}</p>}
                        </div>
                        <div className="cf-group">
                            <label className="cf-label">Total Experience (years) <span className="cf-req">*</span></label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                className={`cf-input${errors.total_experience ? " error" : ""}`}
                                placeholder="e.g. 3.5"
                                value={formData.total_experience}
                                onChange={e => handleChange("total_experience", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.total_experience && <p className="cf-error-msg">{errors.total_experience}</p>}
                        </div>
                    </div>

                    <div className="cf-group">
                        <label className="cf-label">Applied Job ID <span className="cf-req">*</span></label>
                        <input
                            className={`cf-input${errors.applied_job_id ? " error" : ""}`}
                            placeholder="e.g. 64f1a2b3c4d5e6f7a8b9c0d1"
                            value={formData.applied_job_id}
                            onChange={e => handleChange("applied_job_id", e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.applied_job_id && <p className="cf-error-msg">{errors.applied_job_id}</p>}
                    </div>

                    {savedCandidateId && (
                        <div className="cf-group">
                            <ResumeUpload
                                candidateId={savedCandidateId}
                                hasExistingResume={isEdit && Boolean(candidateData?.resume_file_id)}
                            />
                        </div>
                    )}

                    <div className="cf-actions">
                        <button type="button" className="cf-cancel" onClick={() => navigate("/candidates")} disabled={isLoading}>
                            Cancel
                        </button>
                        {!savedCandidateId ? (
                            <button type="submit" className="cf-submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Candidate"}
                            </button>
                        ) : isEdit ? (
                            <button type="submit" className="cf-submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Update Candidate"}
                            </button>
                        ) : (
                            <button type="button" className="cf-submit" onClick={() => navigate("/candidates")}>
                                Done
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CandidateForm;
