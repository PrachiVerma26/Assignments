import { useState } from "react";
import Navbar from "../navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";
import "./Layout.css";

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="layout">
            <Navbar onMenuToggle={toggleSidebar} />
            <div className="layout-body">
                <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
                <main className="layout-content">{children}</main>
            </div>
        </div>
    );
}

export default Layout;