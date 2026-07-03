import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import CandidateForm from "../../components/candidate/CandidateForm";
import { getCandidateById } from "../../services/candidateService";

function CandidateRegistration() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [candidateData, setCandidateData] = useState(null);
    const [isLoading, setIsLoading] = useState(isEdit);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEdit) return;
        const fetch = async () => {
            setIsLoading(true);
            setError("");
            try {
                const data = await getCandidateById(id);
                setCandidateData(data);
            } catch (err) {
                setError(err.message || "Failed to load candidate.");
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [id, isEdit]);

    return (
        <Layout>
            {isLoading && <div style={{ padding: "1rem", color: "#6b7280" }}>Loading...</div>}
            {error && <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "0.875rem" }}>{error}</div>}
            {!isLoading && !error && (
                <CandidateForm mode={isEdit ? "edit" : "create"} candidateData={candidateData} />
            )}
        </Layout>
    );
}

export default CandidateRegistration;
