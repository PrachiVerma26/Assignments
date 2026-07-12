import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createCandidate, updateCandidate, updateCandidateStatus } from "../../services/candidateService";
import { getJobs as fetchJobs } from "../../services/jobService";
import ResumeUpload from "./ResumeUpload";
import "./CandidateForm.css";
import {EMPTY_FORM, STATUS_OPTIONS} from "../../constants/candidateConstants";

const EXPERIENCE_PATTERN = /^(?:(\d+)\s+Years)(?:\s+(\d+)\s+Months)?|(\d+)\s+Months$/i;

function CandidateForm({ mode, candidateData }) {
    const navigate = useNavigate();
    const isEdit = mode === "edit";
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [savedCandidateId, setSavedCandidateId] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [candidateStatus, setCandidateStatus] = useState("");
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusError, setStatusError] = useState("");
    const [statusSuccess, setStatusSuccess] = useState("");

    useEffect(() => {
        const loadJobs = async () => {
            try {
                const data = await fetchJobs({ page: 1, limit: 100 });
                setJobs(data.jobs || []);
            } catch (err) {
                console.error("Failed to load jobs:", err);
            } finally {
                setJobsLoading(false);
            }
        };
        loadJobs();
    }, []);

    useEffect(() => {
        if (isEdit && candidateData) {
            setFormData({
                first_name: candidateData.first_name || "",
                last_name: candidateData.last_name || "",
                email: candidateData.email || "",
                mobile: candidateData.mobile || "",
                current_company: candidateData.current_company || "",
                experience_years: candidateData.experience_years ?? "",
                experience_months: candidateData.experience_months ?? "",
                applied_job_id: candidateData.applied_job?.id || "",
            });
            setSavedCandidateId(candidateData.id);
            setCandidateStatus(candidateData.status || "");
        }
    }, [isEdit, candidateData]);

    const validate = (data) => {
        const e = {};
        if (!data.first_name.trim())       e.first_name = "First name is required.";
        if (!data.last_name.trim())        e.last_name = "Last name is required.";
        if (!data.email.trim())            e.email = "Email is required.";
        if (!data.mobile.trim())           e.mobile = "Phone number is required.";
        else {
            // Frontend enforcement (basic): backend expects mobile to be a string of <=10 chars.
            // Requirement from user: show exactly-10-digit message.
            const digitsOnly = data.mobile.replace(/\D/g, "");
            if (digitsOnly.length !== 10) e.mobile = "Mobile number must contain exactly 10 digits.";
        }
        if (!data.current_company.trim())  e.current_company = "Current company is required.";
        if (data.experience_years === "" || data.experience_years === null) e.experience_years = "Years of experience is required.";
        if (data.experience_months === "" || data.experience_months === null) e.experience_months = "Months of experience is required.";
        if (parseInt(data.experience_months) > 11) e.experience_months = "Months must be between 0 and 11.";
        if (!data.applied_job_id.trim())   e.applied_job_id = "Applied job is required.";
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
                experience_years: parseInt(formData.experience_years),
                experience_months: parseInt(formData.experience_months),
                applied_job_id: formData.applied_job_id.trim(),
            };
            if (isEdit) {
                await updateCandidate(candidateData.id, payload);
                navigate("/candidates", { state: { message: "Candidate updated successfully!", type: "success" } });
            } else {
                const created = await createCandidate(payload);
                setSavedCandidateId(created.id);
                navigate("/dashboard", { replace: true });
            }
        } catch (err) {
            setApiError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setStatusLoading(true);
        setStatusError("");
        setStatusSuccess("");
        try {
            await updateCandidateStatus(candidateData.id, newStatus);
            setCandidateStatus(newStatus);
            setStatusSuccess("Status updated successfully!");
            setTimeout(() => setStatusSuccess(""), 3000);
        } catch (err) {
            setStatusError(err.message || "Failed to update status.");
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDone = () => {
        navigate("/candidates", { state: { message: "Candidate registered successfully!", type: "success" } });
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
                                placeholder="e.g. Ram"
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
                                placeholder="e.g. Verma"
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
                                placeholder="e.g. ram@gmail.com"
                                value={formData.email}
                                onChange={e => handleChange("email", e.target.value)}
                                disabled={isLoading}/>
                            {errors.email && <p className="cf-error-msg">{errors.email}</p>}
                        </div>
                        <div className="cf-group">
                            <label className="cf-label">Phone <span className="cf-req">*</span></label>
                            <input
                                className={`cf-input${errors.mobile ? " error" : ""}`}
                                placeholder="e.g. 9876543210"
                                value={formData.mobile}
                                onChange={e => handleChange("mobile", e.target.value)}
                                disabled={isLoading}/>
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
                                disabled={isLoading}/>
                            {errors.current_company && <p className="cf-error-msg">{errors.current_company}</p>}
                        </div>
                    </div>

                    <div className="cf-row">
                        <div className="cf-group">
                            <label className="cf-label">Experience - Years <span className="cf-req">*</span></label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className={`cf-input${errors.experience_years ? " error" : ""}`}
                                placeholder="e.g. 3"
                                value={formData.experience_years}
                                onChange={e => handleChange("experience_years", e.target.value)}
                                disabled={isLoading}/>
                            {errors.experience_years && <p className="cf-error-msg">{errors.experience_years}</p>}
                        </div>
                        <div className="cf-group">
                            <label className="cf-label">Experience - Months <span className="cf-req">*</span></label>
                            <input
                                type="number"
                                min="0"
                                max="11"
                                className={`cf-input${errors.experience_months ? " error" : ""}`}
                                placeholder="e.g. 6"
                                value={formData.experience_months}
                                onChange={e => handleChange("experience_months", e.target.value)}
                                disabled={isLoading}/>
                            {errors.experience_months && <p className="cf-error-msg">{errors.experience_months}</p>}
                        </div>
                    </div>

                    <div className="cf-group">
                        <label className="cf-label">Applied Job <span className="cf-req">*</span></label>
                        <select
                            className={`cf-input${errors.applied_job_id ? " error" : ""}`}
                            value={formData.applied_job_id}
                            onChange={e => handleChange("applied_job_id", e.target.value)}
                            disabled={isLoading || jobsLoading}>
                            <option value="">Select a job</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                        {errors.applied_job_id && <p className="cf-error-msg">{errors.applied_job_id}</p>}
                    </div>

                    {savedCandidateId && (
                        <div className="cf-group">
                            <ResumeUpload candidateId={savedCandidateId} hasExistingResume={isEdit && Boolean(candidateData?.resume_file_id)}/>
                        </div>
                    )}

                    {isEdit && savedCandidateId && (
                        <div className="cf-group">
                            <label className="cf-label">Candidate Status</label>
                            <div className="cf-status-section">
                                {statusSuccess && <div className="cf-status-success">{statusSuccess}</div>}
                                {statusError && <div className="cf-status-error">{statusError}</div>}
                                <div className="cf-status-options">
                                    {STATUS_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`cf-status-btn${candidateStatus === option.value ? " active" : ""}`}
                                            onClick={() => handleStatusChange(option.value)}
                                            disabled={statusLoading}>{option.label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="cf-actions">
                        <button type="button" className="cf-cancel" onClick={() => navigate("/candidates")} disabled={isLoading || statusLoading}> Cancel </button>
                        {!savedCandidateId ? (
                            <button type="submit" className="cf-submit" disabled={isLoading}> {isLoading ? "Saving..." : "Save Candidate"}</button>
                        ) : isEdit ? (
                            <button type="submit" className="cf-submit" disabled={isLoading || statusLoading}>{isLoading ? "Saving..." : "Update Candidate"} </button>
                        ) : (
                            <button type="button" className="cf-submit" onClick={handleDone}> Done</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CandidateForm;