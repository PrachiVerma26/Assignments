import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { getSession } from "../../utils/session";
import "./Sidebar.css";

function Sidebar({ isOpen, closeSidebar }) {
    const session = getSession();
    const isInterviewer = session?.role === "INTERVIEWER";
    const location = useLocation();

    useEffect(() => { closeSidebar(); }, [location.pathname, closeSidebar]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const navLinkClass = ({ isActive }) => `sidebar-link${isActive ? " active" : ""}`;

    return (
        <>
            <div className={`sidebar-overlay${isOpen ? " open" : ""}`} onClick={closeSidebar} />

            <aside className={`sidebar${isOpen ? " open" : ""}`}>
                <div className="sidebar-header">
                    <span className="sidebar-title">Menu</span>
                    <button className="sidebar-close" onClick={closeSidebar} aria-label="Close menu">
                        <X size={18} />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" className={navLinkClass} onClick={closeSidebar}>
                        <span>Dashboard</span>
                    </NavLink>
                    {!isInterviewer && (
                        <>
                            <NavLink to="/jobs" className={navLinkClass} onClick={closeSidebar}>
                                <span>Job</span>
                            </NavLink>
                            <NavLink to="/candidates" className={navLinkClass} onClick={closeSidebar}>
                                <span>Candidate</span>
                            </NavLink>
                        </>
                    )}
                    <NavLink
                        to={isInterviewer ? "/interviews/feedback" : "/interviews"}
                        className={navLinkClass}
                        onClick={closeSidebar}
                    >
                        <span>Interview</span>
                    </NavLink>
                </nav>
            </aside>
        </>
    );
}

export default Sidebar;