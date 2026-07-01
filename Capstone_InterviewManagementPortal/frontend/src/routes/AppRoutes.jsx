/** Defines all application routes.*/

import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserList from "../pages/Users/UserList";
import JobList from "../pages/Jobs/JobList";
import JobDetail from "../pages/Jobs/JobDetail";

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
        </Routes>
    );
}

export default AppRoutes;