import { getSession } from "../../utils/session";
import Layout from "../../components/layout/Layout";
import "./Dashboard.css";

function Dashboard() {
    const session = getSession();

    return (
        <Layout>
            <div className="dashboard-card">
                <h2>Welcome, {session?.name || "User"}!</h2>
                <p>Login completed successfully.</p>
                <p>Role: {session?.role}</p>
                <p>Email: {session?.email}</p>
            </div>
        </Layout>
    );
}

export default Dashboard;
