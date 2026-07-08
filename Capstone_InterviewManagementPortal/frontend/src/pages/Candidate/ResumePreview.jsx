import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { getCandidateById, viewResume } from "../../services/candidateService";
import "./ResumePreview.css";

function ResumePreview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let objectUrl = null;
        const load = async () => {
            setIsLoading(true);
            setError("");
            try {
                const [candidateData, pdfBlob] = await Promise.all([
                    getCandidateById(id),
                    viewResume(id),
                ]);
                setCandidate(candidateData);
                objectUrl = URL.createObjectURL(pdfBlob);
                setPdfUrl(objectUrl);
            } catch (err) {
                setError(err.message || "Failed to load resume.");
            } finally {
                setIsLoading(false);
            }
        };
        load();
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [id]);

    const handleDownload = () => {
        if (!pdfUrl) return;
        const a = document.createElement("a");
        a.href = pdfUrl;
        a.download = `resume_${id}.pdf`;
        a.click();
    };

    return (
        <Layout>
            <div className="rp-page">
                <div className="rp-breadcrumb">
                    <span className="rp-breadcrumb-link" onClick={() => navigate("/candidates")}>Candidates</span>
                    <ChevronRight size={14} className="rp-breadcrumb-sep" />
                    <span className="rp-breadcrumb-link" onClick={() => navigate(`/candidates/${id}`)}>Candidate Details</span>
                    <ChevronRight size={14} className="rp-breadcrumb-sep" />
                    <span className="rp-breadcrumb-current">Resume Preview</span>
                </div>
                <h2 className="rp-title">Resume Preview</h2>
                <p className="rp-subtitle">View and download candidate resume</p>

                {isLoading && <div className="rp-state">Loading...</div>}
                {error && <div className="rp-state error">{error}</div>}

                {candidate && !isLoading && !error && (
                    <>
                        <div className="rp-card">
                            <div className="rp-row">
                                <span className="rp-label">Candidate</span>
                                <span className="rp-value">{candidate.first_name} {candidate.last_name}</span>
                            </div>
                            <div className="rp-row">
                                <span className="rp-label">Email</span>
                                <span className="rp-value">{candidate.email}</span>
                            </div>
                            {candidate.resume_file_id && (
                                <div className="rp-row">
                                    <span className="rp-label">Resume File ID</span>
                                    <span className="rp-value">{candidate.resume_file_id}</span>
                                </div>
                            )}
                            {candidate.updated_at && (
                                <div className="rp-row">
                                    <span className="rp-label">Last Updated</span>
                                    <span className="rp-value">{new Date(candidate.updated_at).toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="rp-actions">
                            <button className="rp-btn-secondary" onClick={handleDownload} disabled={!pdfUrl}>
                                Download Resume
                            </button>
                            <button className="rp-btn-primary" onClick={() => navigate(`/candidates/${id}/edit`)}>
                                Replace Resume
                            </button>
                        </div>

                        {pdfUrl && (
                            <div className="rp-preview-container">
                                <iframe
                                    src={pdfUrl}
                                    title="Resume Preview"
                                    className="rp-iframe"
                                />
                            </div>
                        )}
                    </>
                )}

                <button className="rp-back-btn" onClick={() => navigate(`/candidates/${id}`)}>
                    ← Back to Candidate Details
                </button>
            </div>
        </Layout>
    );
}

export default ResumePreview;
