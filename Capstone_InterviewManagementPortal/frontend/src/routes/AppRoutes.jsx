import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Login from "../pages/Login/Login";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserList from "../pages/Users/UserList";
import JobList from "../pages/Jobs/JobList";
import JobDetail from "../pages/Jobs/JobDetail";
import CandidateList from "../pages/Candidate/CandidateList";
import CandidateDetail from "../pages/Candidate/CandidateDetail";
import CandidateRegistration from "../pages/Candidate/CandidateRegistration";
import ResumePreview from "../pages/Candidate/ResumePreview";

function ResumeUploadRedirect() {
    const { id } = useParams();
    return <Navigate to={`/candidates/${id}/edit`} replace />;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />}/>
            <Route path="/reset-password" element={<ResetPassword />}/>
            <Route path="/dashboard" element={<Dashboard />}/>
            <Route path="/users" element={<UserList />}/>
            <Route path="/jobs" element={<JobList />}/>
            <Route path="/jobs/:id" element={<JobDetail />}/>
            <Route path="/jobs/create" element={<Navigate to="/jobs" replace />}/>
            <Route path="/jobs/:id/edit" element={<Navigate to="/jobs" replace />}/>
            <Route path="/candidates" element={<CandidateList />}/>
            <Route path="/candidates/create" element={<CandidateRegistration />}/>
            <Route path="/candidates/:id" element={<CandidateDetail />}/>
            <Route path="/candidates/:id/edit" element={<CandidateRegistration />}/>
            <Route path="/candidates/:id/resume/preview" element={<ResumePreview />}/>
            <Route path="/candidates/:id/resume/upload" element={<ResumeUploadRedirect />}/>
        </Routes>
    );
}

export default AppRoutes;
