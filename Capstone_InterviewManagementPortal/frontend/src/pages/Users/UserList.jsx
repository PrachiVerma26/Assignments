import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import ActionsMenu from "../../components/actions/ActionsMenu";
import Layout from "../../components/layout/Layout";
import { getUsers, disableUser, enableUser } from "../../services/userService";
import UserModal from "../../components/users/UserModal";
import useDebounce from "../../utils/useDebounce";
import "./Users.css";

const USERS_PER_PAGE = 10;

function UserList() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [userActionsLoading, setUserActionsLoading] = useState(new Set());
    const [modalState, setModalState] = useState({ isOpen: false, mode: "create", selectedUser: null });
    const [successMessage, setSuccessMessage] = useState("");

    const debouncedSearch = useDebounce(searchTerm, 400);

    const fetchUsers = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError("");
        try {
            const filters = {
                page,
                limit: USERS_PER_PAGE,
                search: debouncedSearch,
                active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : null,
                role: roleFilter,
            };
            const response = await getUsers(filters);
            setUsers(response.users || []);
            setPagination(prev => ({
                ...prev,
                currentPage: page,
                totalPages: response.total_pages || 1,
                totalUsers: response.total || 0,
            }));
        } catch (err) {
            setError(err.message || "Failed to load users.");
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, roleFilter, statusFilter]);

    useEffect(() => { fetchUsers(1); }, [fetchUsers]);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 5000);
    };

    const setUserLoading = (userId, loading) => {
        setUserActionsLoading(prev => {
            const next = new Set(prev);
            loading ? next.add(userId) : next.delete(userId);
            return next;
        });
    };

    const handleDisableUser = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        setUserLoading(userId, true);
        try {
            await disableUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "INACTIVE" } : u));
            showSuccess(`User "${user.name}" has been disabled successfully.`);
        } catch (err) {
            setError(err.message || "Failed to disable user.");
        } finally {
            setUserLoading(userId, false);
        }
    };

    const handleEnableUser = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        setUserLoading(userId, true);
        try {
            await enableUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "ACTIVE" } : u));
            showSuccess(`User "${user.name}" has been enabled successfully.`);
        } catch (err) {
            setError(err.message || "Failed to enable user.");
        } finally {
            setUserLoading(userId, false);
        }
    };

    const handleEditUser = (userId) => {
        const userToEdit = users.find(u => u.id === userId);
        if (userToEdit) setModalState({ isOpen: true, mode: "edit", selectedUser: userToEdit });
    };

    const handleUserSuccess = (updatedUser) => {
        const action = modalState.mode === "create" ? "created" : "updated";
        showSuccess(`User ${action} successfully!`);
        if (modalState.mode === "edit" && updatedUser) {
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        } else {
            fetchUsers(pagination.currentPage);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.totalPages) return;
        fetchUsers(page);
    };

    return (
        <Layout showSidebar={false}>
            <div className="users-page">
                <div className="users-page-header">
                    <h2 className="users-title">Users</h2>
                    <button className="add-user-btn" onClick={() => setModalState({ isOpen: true, mode: "create", selectedUser: null })}>
                        <Plus size={16} /> Add User
                    </button>
                </div>
                <div className="users-filters">
                    <div className="search-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={event => setSearchTerm(event.target.value)}
                            className="search-input"
                        />
                    </div>
                    <select className="filter-select" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}>
                        <option value="">All Roles</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="HR">HR</option>
                        <option value="INTERVIEWER">INTERVIEWER</option>
                    </select>
                    <select className="filter-select" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                        <button type="button" className="close-message-btn" onClick={() => setSuccessMessage("")} aria-label="Close">x</button>
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}
                <div className="users-table-container">
                    {isLoading ? (
                        <div className="loading-message">Loading users...</div>
                    ) : (
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
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-users">
                                            {searchTerm || roleFilter || statusFilter ? "No users found matching your search criteria." : "No users available."}
                                        </td>
                                    </tr>
                                ) : users.map((user, index) => {
                                    const isUserLoading = userActionsLoading.has(user.id);
                                    return (
                                        <tr key={user.id}>
                                            <td>{(pagination.currentPage - 1) * USERS_PER_PAGE + index + 1}</td>
                                            <td className="user-name">{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <span className={`status-badge ${user.status === "ACTIVE" ? "active" : "inactive"}`}>
                                                    {user.status === "ACTIVE" ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>{formatDate(user.created_at)}</td>
                                            <td className="actions-cell">
                                                <ActionsMenu
                                                    items={[
                                                        {
                                                            label: user.status === "ACTIVE" ? "Disable User" : "Enable User",
                                                            onClick: () => user.status === "ACTIVE" ? handleDisableUser(user.id) : handleEnableUser(user.id),
                                                            disabled: isUserLoading,
                                                        },
                                                        { label: "Edit User", onClick: () => handleEditUser(user.id), disabled: isUserLoading },
                                                    ]}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {!isLoading && users.length > 0 && (
                    <div className="users-pagination">
                        <div className="pagination-info">
                            Showing {(pagination.currentPage - 1) * USERS_PER_PAGE + 1} to{" "}
                            {Math.min(pagination.currentPage * USERS_PER_PAGE, pagination.totalUsers)} of{" "}
                            {pagination.totalUsers} users
                        </div>
                        <div className="pagination-controls">
                            <button className="pagination-btn" onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>Previous</button>
                            <button className="pagination-btn active" onClick={() => handlePageChange(pagination.currentPage)}>{pagination.currentPage}</button>
                            <button className="pagination-btn" onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>Next</button>
                        </div>
                    </div>
                )}
                <UserModal
                    mode={modalState.mode}
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState({ isOpen: false, mode: "create", selectedUser: null })}
                    onSuccess={handleUserSuccess}
                    selectedUser={modalState.selectedUser}
                />
            </div>
        </Layout>
    );
}

export default UserList;