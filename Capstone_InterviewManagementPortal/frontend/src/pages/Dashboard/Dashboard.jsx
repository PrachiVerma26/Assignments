import { useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../../utils/session";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const session = getSession();

    const handleLogout = () => {
        clearSession();
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Interview Management Portal</h1>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
            
            <div className="dashboard-card">
                <h2>Welcome, {session?.name || "User"}!</h2>
                <p>Login completed successfully.</p>
                <p>Role: {session?.role}</p>
                <p>Email: {session?.email}</p>
            </div>
        </div>
    );
}

export default Dashboard;
