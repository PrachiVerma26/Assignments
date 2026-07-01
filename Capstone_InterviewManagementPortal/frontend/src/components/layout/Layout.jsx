import Navbar from "../navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";
import "./Layout.css";

function Layout({ children }) {
    return (
        <div className="layout">
            <Navbar />
            <div className="layout-body">
                <Sidebar /><main className="layout-content">{children}</main>
            </div>
        </div>
    );
}

export default Layout;
