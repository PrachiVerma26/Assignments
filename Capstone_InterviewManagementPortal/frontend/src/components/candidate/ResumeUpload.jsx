import { useState, useRef } from "react";
import { uploadResume, viewResume } from "../../services/candidateService";
import "./ResumeUpload.css";

function ResumeUpload({ candidateId, hasExistingResume = false, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [uploaded, setUploaded] = useState(false);
    const [showReplace, setShowReplace] = useState(false);
    const fileInputRef = useRef(null);

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

    const handleUpload = async () => {
        setApiError("");
        setSuccessMsg("");
        if (!file) { setFileError("Please select a PDF file."); return; }
        setIsLoading(true);
        try {
            await uploadResume(candidateId, file);
            setSuccessMsg("Resume uploaded successfully.");
            setUploaded(true);
            setShowReplace(false);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            setApiError(err.message || "Resume upload failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreview = async () => {
        try {
            const blob = await viewResume(candidateId);
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch (err) {
            setApiError(err.message || "Failed to load resume.");
        }
    };

    const showUploadSection = !hasExistingResume || showReplace || uploaded;

    return (
        <div className="ru-section">
            <label className="cf-label">Resume</label>
            {apiError && <div className="ru-api-error">{apiError}</div>}
            {successMsg && <div className="ru-success">{successMsg}</div>}
            {hasExistingResume && !showReplace && !uploaded && (
                <div className="ru-existing">
                    <span className="ru-existing-label">Current Resume on file</span>
                    <div className="ru-existing-actions">
                        <button type="button" className="ru-btn-preview" onClick={handlePreview}>
                            Preview Resume
                        </button>
                        <button type="button" className="ru-btn-replace" onClick={() => setShowReplace(true)}>
                            Replace Resume
                        </button>
                    </div>
                </div>
            )}
            {showUploadSection && (
                <div className="ru-upload-row">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className={`cf-input ru-file-input${fileError ? " error" : ""}`}
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                    {file && <span className="ru-filename">{file.name}</span>}
                    {fileError && <p className="cf-error-msg">{fileError}</p>}
                    <div className="ru-upload-actions">
                        {showReplace && (
                            <button type="button" className="cf-cancel" onClick={() => { setShowReplace(false); setFile(null); setFileError(""); setApiError(""); }} disabled={isLoading}>
                                Cancel
                            </button>
                        )}
                        <button type="button" className="cf-submit" onClick={handleUpload} disabled={isLoading || !file}>
                            {isLoading ? "Uploading..." : "Upload Resume"}
                        </button>
                    </div>
                </div>
            )}
            {uploaded && (
                <button type="button" className="ru-btn-preview" onClick={handlePreview}>
                    Preview Resume
                </button>
            )}
        </div>
    );
}

export default ResumeUpload;
