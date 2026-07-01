import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) =>`sidebar-link${isActive ? " active" : ""}`}>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/jobs" className={({ isActive }) =>`sidebar-link${isActive ? " active" : ""}`}>
                    <span>Job</span>
                </NavLink>

            </nav>
        </aside>
    );
}

export default Sidebar;