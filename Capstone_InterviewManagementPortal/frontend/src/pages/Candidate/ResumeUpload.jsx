import { useParams, Navigate } from "react-router-dom";

function ResumeUploadPage() {
    const { id } = useParams();
    return <Navigate to={`/candidates/${id}/edit`} replace />;
}

export default ResumeUploadPage;
