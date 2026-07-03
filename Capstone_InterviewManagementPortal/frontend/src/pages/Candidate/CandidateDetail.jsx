import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { getCandidateById } from "../../services/candidateService";
import "./CandidateDetail.css";

function CandidateDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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
                )}

                <button className="cd-back-btn" onClick={() => navigate("/candidates")}>
                    ← Back to Candidates
                </button>
            </div>
        </Layout>
    );
}

export default CandidateDetail;
