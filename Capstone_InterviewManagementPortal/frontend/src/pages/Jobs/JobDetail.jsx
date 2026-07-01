import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { getJobById } from "../../services/jobService";
import "./JobDetail.css";

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchJob = async () => {
            setIsLoading(true);
            setError("");
            try {
                const data = await getJobById(id);
                setJob(data.job);
            } catch (err) {
                setError(err.message || "Failed to load job details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const renderField = (label, value) => {
        if (!value) return null;
        return (
            <div className="jd-row">
                <span className="jd-label">{label}</span>
                <span className="jd-value">{value}</span>
            </div>
        );
    };

    return (
        <Layout>
            <div className="jd-page">
                {/* Breadcrumb */}
                <div className="jd-breadcrumb">
                    <span className="jd-breadcrumb-link" onClick={() => navigate("/jobs")}>Jobs</span>
                    <ChevronRight size={14} className="jd-breadcrumb-sep" />
                    <span className="jd-breadcrumb-current">Job Details</span>
                </div>
                <h2 className="jd-title">Job Details</h2>
                <p className="jd-subtitle">View job description details</p>
                {isLoading && <div className="jd-state">Loading...</div>}
                {error && <div className="jd-state error">{error}</div>}

                {job && (
                    <div className="jd-card">
                        {renderField("Job Title",           job.title)}
                        {renderField("Location",            job.location)}
                        {renderField("Department",          job.department)}
                        {renderField("Employment Type",     job.employment_type)}
                        {renderField("Experience Required", job.experience_level)}
                        {renderField("Salary Range",        job.salary_range)}
                        {renderField("Required Skills",     job.requirements)}
                        {renderField("Job Description",     job.description)}
                    </div>
                )}

                <button className="jd-back-btn" onClick={() => navigate("/jobs")}>
                    ← Back to Jobs
                </button>
            </div>
        </Layout>
    );
}

export default JobDetail;
