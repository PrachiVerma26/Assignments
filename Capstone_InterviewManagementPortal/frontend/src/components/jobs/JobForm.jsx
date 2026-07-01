import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createJob, updateJob } from "../../services/jobService";
import "./JobForm.css";

const EMPTY_FORM = {
    title: "",
    description: "",
    requirements: "",
    location: "",
    employment_type: "",
    salary_range: "",
    department: "",
    experience_level: "",
};

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

function JobForm({ mode, isOpen, onClose, onSuccess, jobData }) {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const isEdit = mode === "edit";

    useEffect(() => {
        if (!isOpen) return;
        setErrors({});
        setApiError("");
        setFormData(
            isEdit && jobData
                ? {
                    title: jobData.title || "",
                    description: jobData.description || "",
                    requirements: jobData.requirements || "",
                    location: jobData.location || "",
                    employment_type: jobData.employment_type || "",
                    salary_range: jobData.salary_range || "",
                    department: jobData.department || "",
                    experience_level: jobData.experience_level || "",
                }
                : EMPTY_FORM
        );
    }, [isOpen, mode, jobData, isEdit]);

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

    const validate = (data) => {
        const e = {};
        if (!data.title.trim())           e.title = "Job title is required.";
        if (!data.description.trim())     e.description = "Description is required.";
        if (!data.requirements.trim())    e.requirements = "Requirements are required.";
        if (!data.location.trim())        e.location = "Location is required.";
        if (!data.employment_type.trim()) e.employment_type = "Employment type is required.";
        if (!data.salary_range.trim())    e.salary_range = "Salary range is required.";
        if (!data.department.trim())      e.department = "Department is required.";
        if (!data.experience_level.trim()) e.experience_level = "Experience level is required.";
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
            // Payload matches backend schema exactly
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                requirements: formData.requirements.trim(),
                location: formData.location.trim(),
                employment_type: formData.employment_type.trim(),
                salary_range: formData.salary_range.trim(),
                department: formData.department.trim(),
                experience_level: formData.experience_level.trim(),
            };
            if (isEdit) {
                await updateJob(jobData.id, payload);
            } else {
                await createJob(payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setApiError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="jf-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="jf-modal">
                <div className="jf-header">
                    <h2 className="jf-title">{isEdit ? "Edit Job" : "Create Job"}</h2>
                    <button className="jf-close" onClick={onClose} aria-label="Close modal">
                        <X size={18} />
                    </button>
                </div>

                <form className="jf-form" onSubmit={handleSubmit} noValidate>
                    {apiError && <div className="jf-api-error">{apiError}</div>}

                    {/* Row 1: Title + Location */}
                    <div className="jf-row">
                        <div className="jf-group">
                            <label className="jf-label">Job Title <span className="jf-req">*</span></label>
                            <input
                                className={`jf-input${errors.title ? " error" : ""}`}
                                placeholder="e.g. Backend Developer"
                                value={formData.title}
                                onChange={e => handleChange("title", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.title && <p className="jf-error-msg">{errors.title}</p>}
                        </div>
                        <div className="jf-group">
                            <label className="jf-label">Location <span className="jf-req">*</span></label>
                            <input
                                className={`jf-input${errors.location ? " error" : ""}`}
                                placeholder="e.g. Bangalore"
                                value={formData.location}
                                onChange={e => handleChange("location", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.location && <p className="jf-error-msg">{errors.location}</p>}
                        </div>
                    </div>

                    {/* Row 2: Department + Employment Type */}
                    <div className="jf-row">
                        <div className="jf-group">
                            <label className="jf-label">Department <span className="jf-req">*</span></label>
                            <input
                                className={`jf-input${errors.department ? " error" : ""}`}
                                placeholder="e.g. Engineering"
                                value={formData.department}
                                onChange={e => handleChange("department", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.department && <p className="jf-error-msg">{errors.department}</p>}
                        </div>
                        <div className="jf-group">
                            <label className="jf-label">Employment Type <span className="jf-req">*</span></label>
                            <select
                                className={`jf-input${errors.employment_type ? " error" : ""}`}
                                value={formData.employment_type}
                                onChange={e => handleChange("employment_type", e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="">Select type</option>
                                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {errors.employment_type && <p className="jf-error-msg">{errors.employment_type}</p>}
                        </div>
                    </div>

                    {/* Row 3: Experience Level + Salary Range */}
                    <div className="jf-row">
                        <div className="jf-group">
                            <label className="jf-label">Experience Level <span className="jf-req">*</span></label>
                            <input
                                className={`jf-input${errors.experience_level ? " error" : ""}`}
                                placeholder="e.g. 2-4 Years"
                                value={formData.experience_level}
                                onChange={e => handleChange("experience_level", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.experience_level && <p className="jf-error-msg">{errors.experience_level}</p>}
                        </div>
                        <div className="jf-group">
                            <label className="jf-label">Salary Range <span className="jf-req">*</span></label>
                            <input
                                className={`jf-input${errors.salary_range ? " error" : ""}`}
                                placeholder="e.g. 8-12 LPA"
                                value={formData.salary_range}
                                onChange={e => handleChange("salary_range", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.salary_range && <p className="jf-error-msg">{errors.salary_range}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="jf-group">
                        <label className="jf-label">Job Description <span className="jf-req">*</span></label>
                        <textarea
                            className={`jf-textarea${errors.description ? " error" : ""}`}
                            rows={3}
                            placeholder="Describe the role and responsibilities..."
                            value={formData.description}
                            onChange={e => handleChange("description", e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.description && <p className="jf-error-msg">{errors.description}</p>}
                    </div>

                    {/* Requirements */}
                    <div className="jf-group">
                        <label className="jf-label">Requirements <span className="jf-req">*</span></label>
                        <textarea
                            className={`jf-textarea${errors.requirements ? " error" : ""}`}
                            rows={3}
                            placeholder="Skills, qualifications, and experience required..."
                            value={formData.requirements}
                            onChange={e => handleChange("requirements", e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.requirements && <p className="jf-error-msg">{errors.requirements}</p>}
                    </div>

                    <div className="jf-actions">
                        <button type="button" className="jf-cancel" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                        <button type="submit" className="jf-submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : isEdit ? "Update Job" : "Save Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default JobForm;
