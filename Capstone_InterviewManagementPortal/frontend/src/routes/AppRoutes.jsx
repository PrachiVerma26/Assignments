/** Defines all application routes.*/

import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserList from "../pages/Users/UserList";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />}/>
            <Route path="/reset-password" element={<ResetPassword />}/>
            <Route path="/dashboard" element={<Dashboard />}/>
            <Route path="/users" element={<UserList />}/>
        </Routes>
    );
}

export default AppRoutes;