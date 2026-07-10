import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";
import { clearSession, getSession } from "../../utils/session";
import "./Navbar.css";

function Navbar({ onMenuToggle, isMenuOpen, hasSidebar = true }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const session = getSession();
    const toggleDropdown = () => {setShowDropdown((prev) => !prev);};

    const handleLogout = (event) => {
        event.stopPropagation();
        clearSession();
        navigate("/login");
    };

    return (
        <header className="navbar">
            {hasSidebar && (
                <button
                    className="navbar-hamburger"
                    onClick={onMenuToggle}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <Menu size={22} />
                </button>
            )}
            <h1 className="navbar-title">Interview Management Portal</h1>
            <div className="navbar-profile" onClick={toggleDropdown}>
                <div className="navbar-avatar">{session?.name?.charAt(0).toUpperCase() || "U"}</div>
                <ChevronDown size={16} />
                {showDropdown && (
                    <div className="navbar-dropdown" onClick={(e) => e.stopPropagation()}>
                        <div className="navbar-dropdown-email">{session?.email}</div>
                        <hr className="navbar-dropdown-divider" />
                        <button type="button" className="navbar-dropdown-logout" onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Navbar;