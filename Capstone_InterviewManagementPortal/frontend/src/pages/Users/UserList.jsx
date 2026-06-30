// User listing page
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, disableUser, enableUser } from "../../services/userService";
import { getSession, clearSession } from "../../utils/session";
import UserModal from "../../components/users/UserModal";
import "./Users.css";

function UserList() {
    const navigate = useNavigate();
    const session = getSession();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({currentPage: 1, totalPages: 1, totalUsers: 0, usersPerPage: 10});
    
    // Filter and search states
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [activeActionMenu, setActiveActionMenu] = useState(null);
    const [userActionsLoading, setUserActionsLoading] = useState(new Set());
    
    const [modalState, setModalState] = useState({isOpen: false, mode: "create", selectedUser: null});
    const [successMessage, setSuccessMessage] = useState("");

    const fetchUsers = async (page = 1) => {
        try {
            setIsLoading(true);
            setError("");
            const filters = {
                page,
                limit: pagination.usersPerPage,
                search: searchTerm,
                active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : null
            };
            const response = await getUsers(filters);
            let usersList = response.users || [];
            if (roleFilter) {
                usersList = usersList.filter(user => user.role === roleFilter);
            }
            setUsers(usersList);
            setPagination(prev => ({...prev, currentPage: page, totalPages: Math.ceil(usersList.length / pagination.usersPerPage), totalUsers: usersList.length}));
        } catch (error) {
            setError(error.message || "Failed to load users.");
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load users on component mount and when filters change
    useEffect(() => {fetchUsers(1);}, [searchTerm, roleFilter, statusFilter]);
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };
    const handleRoleFilterChange = (event) => {
        setRoleFilter(event.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };
    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };
    const handlePageChange = (page) => {fetchUsers(page);};
    const handleAddUser = () => {
        setModalState({
            isOpen: true,
            mode: "create",
            selectedUser: null
        });
        setActiveActionMenu(null);
    };

    const handleEditUser = (userId) => {
        const userToEdit = users.find(user => user.id === userId);
        if (userToEdit) {
            setModalState({isOpen: true, mode: "edit", selectedUser: userToEdit});
        }
        setActiveActionMenu(null);
    };

    const handleUserActions = (userId) => {
        setActiveActionMenu(activeActionMenu === userId ? null : userId);
    };

    const setUserLoading = (userId, loading) => {
        setUserActionsLoading(prev => {
            const newSet = new Set(prev);
            if (loading) {
                newSet.add(userId);
            } else {
                newSet.delete(userId);
            }
            return newSet;
        });
    };

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        // clear success message after 5 seconds
        setTimeout(() => {
            setSuccessMessage("");
        }, 5000);
    };

    const handleDisableUser = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        try {
            setUserLoading(userId, true);
            setActiveActionMenu(null);
            await disableUser(userId);
            showSuccessMessage(`User "${user.name}" has been disabled successfully.`);
            fetchUsers(pagination.currentPage); // Refresh the list
        } catch (error) {
            setError(error.message || "Failed to disable user.");
        } finally {
            setUserLoading(userId, false);
        }
    };

    const handleEnableUser = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        try {
            setUserLoading(userId, true);
            setActiveActionMenu(null);
            await enableUser(userId);
            showSuccessMessage(`User "${user.name}" has been enabled successfully.`);
            fetchUsers(pagination.currentPage); // Refresh the list
        } catch (error) {
            setError(error.message || "Failed to enable user.");
        } finally {
            setUserLoading(userId, false);
        }
    };

    const handleUserDropdown = () => {setShowUserDropdown(!showUserDropdown);};
    const handleLogout = () => {clearSession(); navigate("/login");};
    const handleModalClose = () => {
        setModalState({isOpen: false, mode: "create", selectedUser: null});
    };
    
    const handleUserSuccess = () => {
        const action = modalState.mode === "create" ? "created" : "updated";
        setSuccessMessage(`User ${action} successfully!`);
        fetchUsers(pagination.currentPage);
        // Clear success message after 5 seconds
        setTimeout(() => {setSuccessMessage("");}, 5000);
    };
    
    const clearSuccessMessage = () => {setSuccessMessage("");};

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

return (
        <div className="users-container">
            <div className="users-header">
                <h1>Users</h1>
                <div className="user-dropdown-container">
                    <div className="user-info" onClick={handleUserDropdown}>
                        <span className="admin-name">{session?.name || "Admin User"}</span>
                        <span className="dropdown-arrow">▼</span>
                    </div>
                    {showUserDropdown && (
                        <div className="user-dropdown-menu">
                            <div className="dropdown-item"><span className="user-email">{session?.email}</span></div>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout-btn" onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
            <div className="user-content">
                <div className="users-actions"><button className="add-user-btn" onClick={handleAddUser}>Add User</button></div>
                <div className="users-filters">
                    <div className="search-box">
                        <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={handleSearchChange} className="search-input"/>
                    </div>
                    <select className="filter-select" value={roleFilter} onChange={handleRoleFilterChange}>
                        <option value="">All Roles</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="HR">HR</option>
                        <option value="INTERVIEWER">INTERVIEWER</option>
                    </select>
                    <select className="filter-select" value={statusFilter} onChange={handleStatusFilterChange}>
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                        <button type="button" className="close-message-btn" onClick={clearSuccessMessage} aria-label="Close success message">  ✕ </button>
                    </div>
                )}
                {error && (<div className="error-message">{error}</div>)}
                <div className="users-table-container">
                    {isLoading ? (<div className="loading-message">Loading users...</div>) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (users.map((user, index) => {
                                    const isUserLoading = userActionsLoading.has(user.id);
                                    return (
                                        <tr key={user.id}>
                                            <td>{(pagination.currentPage - 1) * pagination.usersPerPage + index + 1}</td>
                                            <td className="user-name">{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <span className={`status-badge ${user.status === 'ACTIVE' ? 'active' : 'inactive'}`}>{user.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                                            </td>
                                            <td>{formatDate(user.created_at)}</td>
                                            <td className="actions-cell">
                                                <div className="action-menu-container">
                                                    <button className="menu-btn"  onClick={() => handleUserActions(user.id)} title="More actions" disabled={isUserLoading}> {isUserLoading ? "Loading..." : "⋮"}</button>
                                                    {activeActionMenu === user.id && (
                                                        <div className="action-dropdown-menu">
                                                            {user.status === 'ACTIVE' ? (
                                                                <button className="dropdown-action" onClick={() => handleDisableUser(user.id)} disabled={isUserLoading}>Disable User</button>) : (
                                                                <button className="dropdown-action" onClick={() => handleEnableUser(user.id)} disabled={isUserLoading}>Enable User</button>)}
                                                            <button className="dropdown-action" onClick={() => handleEditUser(user.id)} disabled={isUserLoading}>Edit User</button>
                                                        </div>)}
                                                </div>
                                            </td>
                                        </tr>);})) : (
                                    <tr>
                                        <td colSpan="7" className="no-users">
                                            {searchTerm || roleFilter || statusFilter ? "No users found matching your search criteria." : "No users available."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                {!isLoading && users.length > 0 && (
                    <div className="users-pagination">
                        <div className="pagination-info">
                            Showing {(pagination.currentPage - 1) * pagination.usersPerPage + 1} to{" "}
                            {Math.min(pagination.currentPage * pagination.usersPerPage, pagination.totalUsers)} of{" "}
                            {pagination.totalUsers} users
                        </div>
                        <div className="pagination-controls">
                            <button className="pagination-btn" onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>❮</button>
                            {Array.from({ length: pagination.totalPages }, (_, index) => (
                                <button key={index + 1} className={`pagination-btn ${pagination.currentPage === index + 1 ? 'active' : ''}`} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>))}
                            <button className="pagination-btn" onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>❯</button>
                        </div>
                    </div>
                )}
            </div>
            <UserModal
                mode={modalState.mode}
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                onSuccess={handleUserSuccess}
                selectedUser={modalState.selectedUser}
            />
        </div>
    );
}
export default UserList;