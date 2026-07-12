import { useCallback, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

function Layout({ children, showSidebar = true }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    return (
        <div className="layout">
            <Navbar onMenuToggle={toggleSidebar} isMenuOpen={sidebarOpen} hasSidebar={showSidebar} />
            <div className="layout-body">
                {showSidebar && <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />}
                <main className="layout-content">{children}</main>
            </div>
        </div>
    );
}

export default Layout;