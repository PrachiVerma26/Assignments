import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Login from "../pages/Login/Login";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import HRDashboard from "../pages/Dashboard/HRDashboard";
import InterviewerDashboard from "../pages/Dashboard/InterviewerDashboard";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import UserList from "../pages/Users/UserList";
import JobList from "../pages/Jobs/JobList";
import JobDetail from "../pages/Jobs/JobDetail";
import CandidateList from "../pages/Candidate/CandidateList";
import CandidateDetail from "../pages/Candidate/CandidateDetail";
import CandidateRegistration from "../pages/Candidate/CandidateRegistration";
import ResumePreview from "../pages/Candidate/ResumePreview";
import InterviewList from "../pages/Interview/InterviewList";
import InterviewDetails from "../pages/Interview/InterviewDetails";
import InterviewFeedback from "../pages/Interview/InterviewFeedback";
import { getSession } from "../utils/session";

function DashboardRoute() {
    const session = getSession();
    if (session?.role === "INTERVIEWER") return <InterviewerDashboard />;
    if (session?.role === "HR") return <HRDashboard />;
    if (session?.role === "ADMIN") return <AdminDashboard />;
    // Unknown/unauthorized role: go to login
    return <Navigate to="/login" replace />;
}

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
            <Route path="/dashboard" element={<DashboardRoute />}/>
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
            <Route path="/interviews" element={<InterviewList />}/>
            <Route path="/interviews/feedback" element={<InterviewFeedback />}/>
            <Route path="/interviews/:id" element={<InterviewDetails />}/>
        </Routes>
    );
}

export default AppRoutes;