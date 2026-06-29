import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, disableUser } from '../../services/userService';
import './Users.css';

function UserList() {
    const navigate = useNavigate();
    
    // State management
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [disablingUserId, setDisablingUserId] = useState(null);

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            const response = await getUsers();
            setUsers(response.users || []);
        } catch (err) {
            setError(err.message || 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle user disable
    const handleDisableUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to disable ${userName}?`)) {
            return;
        }

        try {
            setDisablingUserId(userId);
            await disableUser(userId);
            
            // Update user status in local state
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId 
                        ? { ...user, status: 'INACTIVE' }
                        : user
                )
            );
        } catch (err) {
            alert(err.message || 'Failed to disable user');
        } finally {
            setDisablingUserId(null);
        }
    };

    // Handle edit user
    const handleEditUser = (userId) => {
        navigate(`/users/edit/${userId}`);
    };

    // Handle create user
    const handleCreateUser = () => {
        navigate('/users/create');
    };

    // Render status badge
    const renderStatusBadge = (status) => {
        const statusClass = status === 'ACTIVE' ? 'status-active' : 'status-inactive';
        const statusText = status === 'ACTIVE' ? 'Active' : 'Disabled';
        
        return (
            <span className={`status-badge ${statusClass}`}>
                {statusText}
            </span>
        );
    };

    // Render role with proper formatting
    const renderRole = (role) => {
        const roleMap = {
            'ADMIN': 'Admin',
            'HR': 'HR',
            'INTERVIEWER': 'Interviewer'
        };
        return roleMap[role] || role;
    };

    return (
        <div className="users-container">
            <div className="users-content">
                {/* Page Header */}
                <div className="users-header">
                    <h1>User Management</h1>
                    <p className="users-subtitle">Manage system users and their permissions</p>
                </div>

                {/* Main Content Card */}
                <div className="users-card">
                    {/* Controls */}
                    <div className="users-controls">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            className="primary-button"
                            onClick={handleCreateUser}
                        >
                            Create User
                        </button>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="error-state">
                            <p>{error}</p>
                            <button 
                                className="primary-button" 
                                onClick={fetchUsers}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="loading-state">
                            <p>Loading users...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && filteredUsers.length === 0 && (
                        <div className="empty-state">
                            {users.length === 0 ? (
                                <>
                                    <h3>No users found</h3>
                                    <p>Get started by creating your first user.</p>
                                    <button
                                        className="primary-button"
                                        onClick={handleCreateUser}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        Create User
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h3>No users match your search</h3>
                                    <p>Try adjusting your search criteria.</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Users Table */}
                    {!isLoading && !error && filteredUsers.length > 0 && (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{renderRole(user.role)}</td>
                                            <td>{renderStatusBadge(user.status)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-button edit-button"
                                                        onClick={() => handleEditUser(user.id)}
                                                    >
                                                        Edit
                                                    </button>
                                                    {user.status === 'ACTIVE' && (
                                                        <button
                                                            className="action-button disable-button"
                                                            onClick={() => handleDisableUser(user.id, user.name)}
                                                            disabled={disablingUserId === user.id}
                                                        >
                                                            {disablingUserId === user.id ? 'Disabling...' : 'Disable'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Search Results Info */}
                    {!isLoading && !error && searchQuery && filteredUsers.length > 0 && (
                        <p style={{ marginTop: '1rem', color: '#6b7280', textAlign: 'center' }}>
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserList;