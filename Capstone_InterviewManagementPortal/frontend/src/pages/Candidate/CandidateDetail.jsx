import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../../components/layout/Layout";
import CandidateStatusUpdate from "../../components/candidate/CandidateStatusUpdate";
import { getCandidateById, viewResume } from "../../services/candidateService";
import "./CandidateDetail.css";

function CandidateDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [resumeError, setResumeError] = useState("");

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            setError("");
            try {
                const data = await getCandidateById(id);
                setCandidate(data);
            } catch (err) {
                setError(err.message || "Failed to load candidate details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [id]);

    const handlePreviewResume = async () => {
        setResumeError("");
        try {
            const blob = await viewResume(id);
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch (err) {
            setResumeError(err.message || "Failed to load resume.");
        }
    };

    const handleStatusUpdated = (newStatus) => {
        setCandidate(prev => ({ ...prev, status: newStatus }));
    };

    const renderField = (label, value) => {
        if (!value && value !== 0) return null;
        return (
            <div className="cd-row">
                <span className="cd-label">{label}</span>
                <span className="cd-value">{value}</span>
            </div>
        );
    };

    return (
        <Layout>
            <div className="cd-page">
                <div className="cd-breadcrumb">
                    <span className="cd-breadcrumb-link" onClick={() => navigate("/candidates")}>Candidates</span>
                    <ChevronRight size={14} className="cd-breadcrumb-sep" />
                    <span className="cd-breadcrumb-current">Candidate Details</span>
                </div>
                <h2 className="cd-title">Candidate Details</h2>
                <p className="cd-subtitle">View candidate profile details</p>

                {isLoading && <div className="cd-state">Loading...</div>}
                {error && <div className="cd-state error">{error}</div>}

                {candidate && (
                    <>
                        <div className="cd-card">
                            {renderField("First Name", candidate.first_name)}
                            {renderField("Last Name", candidate.last_name)}
                            {renderField("Email", candidate.email)}
                            {renderField("Phone", candidate.mobile)}
                            {renderField("Current Company", candidate.current_company)}
                            {renderField("Total Experience", `${candidate.total_experience} years`)}
                            {renderField("Applied Job ID", candidate.applied_job_id)}
                            {renderField("Status", candidate.status)}
                        </div>

                        <div className="cd-section-card">
                            <h3 className="cd-section-title">Resume</h3>
                            {resumeError && <div className="cd-section-error">{resumeError}</div>}
                            {candidate.resume_file_id ? (
                                <div className="cd-resume-row">
                                    <span className="cd-value">Current Resume on file</span>
                                    <button className="cd-btn-preview" onClick={handlePreviewResume}>
                                        Preview Resume
                                    </button>
                                </div>
                            ) : (
                                <p className="cd-value">No resume uploaded.</p>
                            )}
                        </div>

                        <div className="cd-section-card">
                            <h3 className="cd-section-title">Candidate Status</h3>
                            <div className="cd-row">
                                <span className="cd-label">Current Status</span>
                                <span className="cd-value">{candidate.status}</span>
                            </div>
                            <div className="cd-status-update">
                                <CandidateStatusUpdate
                                    candidateId={id}
                                    currentStatus={candidate.status}
                                    onStatusUpdated={handleStatusUpdated}
                                />
                            </div>
                        </div>
                    </>
                )}

                <button className="cd-back-btn" onClick={() => navigate("/candidates")}>
                    ← Back to Candidates
                </button>
            </div>
        </Layout>
    );
}

export default CandidateDetail;
