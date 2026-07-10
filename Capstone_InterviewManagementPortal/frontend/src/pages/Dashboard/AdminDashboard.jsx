import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ActionsMenu from "../../components/actions/ActionsMenu";
import { getUsers } from "../../services/userService";
import { getAdminDashboard } from "../../services/interviewService";
import "../../components/interview/Interview.css";
import "../../pages/Users/Users.css";
import "./Dashboard.css";

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const [dashData, response] = await Promise.all([
                getAdminDashboard(),
                getUsers({ page: 1, limit: 5 }),
            ]);
            setStats(dashData);
            setRecentUsers(response.users || []);
        } catch (err) {
            setError(err.message || "Failed to load admin dashboard.");
            setStats(null);
            setRecentUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(fetchData, 0);
        return () => clearTimeout(timeoutId);
    }, [fetchData]);

    const STAT_CARDS = stats
        ? [
              { label: "Total Users", value: stats.total_users ?? "—" },
              { label: "Total Jobs", value: stats.total_jobs ?? "—" },
              { label: "Total Candidates", value: stats.total_candidates ?? "—" },
              { label: "Scheduled Interviews", value: stats.scheduled_interviews ?? "—" },
          ]
        : [];

    const renderActions = () => (
        <ActionsMenu items={[{label: "Edit User",onClick: () => navigate(`/users`), disabled: false},]}/>
    );

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric",});
    };

    return (
        <Layout>
            <div className="iv-dashboard-page">
                {error && <div className="iv-error">{error}</div>}
                {isLoading ? (
                    <p style={{ color: "#9ca3af" }}>Loading...</p>
                ) : (
                    <>
                        <div className="iv-stats-grid">
                            {STAT_CARDS.map((card) => (
                                <div key={card.label} className="iv-stat-card">
                                    <span className="iv-stat-label">{card.label}</span>
                                    <span className="iv-stat-value">{card.value}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="iv-section-header" style={{ marginTop: "1.25rem" }}>
                                <h3 className="iv-section-title">Recently Added Users</h3>
                                <span className="iv-view-all" onClick={() => navigate("/users")}>View All</span>
                            </div>
                            <div className="iv-table-container" style={{ marginTop: "0.75rem" }}>
                                <table className="iv-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentUsers.length === 0 ? (
                                            <tr> <td colSpan={6} className="iv-table-msg">No recent users.</td></tr>
                                        ) : (
                                            recentUsers.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="user-name">{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.role}</td>
                                                    <td>
                                                        <span
                                                            className={`status-badge ${
                                                                user.status === "ACTIVE" ? "active" : "inactive"
                                                            }`}
                                                        >
                                                            {user.status === "ACTIVE" ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(user.created_at)}</td>
                                                    <td className="actions-cell">{renderActions(user)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

export default AdminDashboard;