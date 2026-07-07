import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { uploadResume } from "../../services/candidateService";
import "./ResumeUpload.css";

function ResumeUpload() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        setFileError("");
        setApiError("");
        setSuccessMsg("");
        if (!selected) { setFile(null); return; }
        if (selected.type !== "application/pdf") {
            setFileError("Only PDF files are allowed.");
            setFile(null);
            e.target.value = "";
            return;
        }
        setFile(selected);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        setSuccessMsg("");
        if (!file) { setFileError("Resume is required."); return; }
        setIsLoading(true);
        try {
            await uploadResume(id, file);
            setSuccessMsg("Resume uploaded successfully.");
            setTimeout(() => navigate(`/candidates/${id}/resume/preview`), 1000);
        } catch (err) {
            setApiError(err.message || "Resume upload failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="ru-page">
                <div className="ru-breadcrumb">
                    <span className="ru-breadcrumb-link" onClick={() => navigate("/candidates")}>Candidates</span>
                    <ChevronRight size={14} className="ru-breadcrumb-sep" />
                    <span className="ru-breadcrumb-link" onClick={() => navigate(`/candidates/${id}`)}>Candidate Details</span>
                    <ChevronRight size={14} className="ru-breadcrumb-sep" />
                    <span className="ru-breadcrumb-current">Upload Resume</span>
                </div>
                <h2 className="ru-title">Upload Resume</h2>
                <p className="ru-subtitle">Upload a PDF resume for this candidate</p>

                <div className="ru-card">
                    <form className="ru-form" onSubmit={handleSubmit} noValidate>
                        {apiError && <div className="ru-api-error">{apiError}</div>}
                        {successMsg && <div className="ru-success">{successMsg}</div>}

                        <div className="ru-group">
                            <label className="ru-label">Resume (PDF only) <span className="ru-req">*</span></label>
                            <input
                                type="file"
                                accept="application/pdf"
                                className={`ru-file-input${fileError ? " error" : ""}`}
                                onChange={handleFileChange}
                                disabled={isLoading}
                            />
                            {file && <p className="ru-filename">Selected: {file.name}</p>}
                            {fileError && <p className="ru-error-msg">{fileError}</p>}
                        </div>

                        <div className="ru-actions">
                            <button type="button" className="ru-cancel" onClick={() => navigate(`/candidates/${id}`)} disabled={isLoading}>
                                Cancel
                            </button>
                            <button type="submit" className="ru-submit" disabled={isLoading}>
                                {isLoading ? "Uploading..." : "Upload Resume"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export default ResumeUpload;
