/** Defines all application routes.*/

import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Dashboard from "../pages/Dashboard/Dashboard";

function AppRoutes() {
    return (
        <Routes>

            {/*Default path*/}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />}/>
            <Route path="/reset-password" element={<ResetPassword />}/>

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />}/>
        </Routes>
    );
}

export default AppRoutes;