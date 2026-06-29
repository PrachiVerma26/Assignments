import { useState, useEffect } from 'react';
import './Users.css';

function UserForm({ initialValues = {}, onSubmit, onCancel, isLoading = false, submitButtonText = 'Create User' }) {
    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation state
    const [errors, setErrors] = useState({});

    // Available roles
    const roles = [
        { value: 'ADMIN', label: 'Admin' },
        { value: 'HR', label: 'HR' },
        { value: 'INTERVIEWER', label: 'Interviewer' }
    ];

    // Initialize form with provided values
    useEffect(() => {
        if (initialValues.name) {
            const nameParts = initialValues.name.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
        }
        setEmail(initialValues.email || '');
        setRole(initialValues.role || '');
        // Don't populate passwords for edit mode
    }, [initialValues]);

    // Form validation
    const validateForm = () => {
        const validationErrors = {};

        // First Name validation
        if (!firstName.trim()) {
            validationErrors.firstName = 'First name is required.';
        } else if (firstName.trim().length < 2) {
            validationErrors.firstName = 'First name must be at least 2 characters.';
        }

        // Last Name validation
        if (!lastName.trim()) {
            validationErrors.lastName = 'Last name is required.';
        }

        // Email validation
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            validationErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            validationErrors.email = 'Please enter a valid email address.';
        }

        // Role validation
        if (!role) {
            validationErrors.role = 'Role is required.';
        }

        // Password validation (only for create mode)
        if (!initialValues.id) {
            if (!password.trim()) {
                validationErrors.password = 'Password is required.';
            } else if (password.length < 6) {
                validationErrors.password = 'Password must be at least 6 characters.';
            }

            if (!confirmPassword.trim()) {
                validationErrors.confirmPassword = 'Please confirm your password.';
            } else if (password !== confirmPassword) {
                validationErrors.confirmPassword = 'Passwords do not match.';
            }
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const formData = {
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            email: email.trim(),
            role
        };

        // Add password for create mode
        if (!initialValues.id && password) {
            formData.password = password;
        }

        onSubmit(formData);
    };

    // Clear field errors on input change
    const clearFieldError = (field) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form className="user-form" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                        id="firstName"
                        type="text"
                        placeholder="Enter first name"
                        value={firstName}
                        onChange={(e) => {
                            setFirstName(e.target.value);
                            clearFieldError('firstName');
                        }}
                    />
                    {errors.firstName && (
                        <p className="error-message">{errors.firstName}</p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                        id="lastName"
                        type="text"
                        placeholder="Enter last name"
                        value={lastName}
                        onChange={(e) => {
                            setLastName(e.target.value);
                            clearFieldError('lastName');
                        }}
                    />
                    {errors.lastName && (
                        <p className="error-message">{errors.lastName}</p>
                    )}
                </div>
            </div>

            {/* Email */}
            <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        clearFieldError('email');
                    }}
                />
                {errors.email && (
                    <p className="error-message">{errors.email}</p>
                )}
            </div>

            {/* Role */}
            <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => {
                        setRole(e.target.value);
                        clearFieldError('role');
                    }}
                >
                    <option value="">Select a role</option>
                    {roles.map(roleOption => (
                        <option key={roleOption.value} value={roleOption.value}>
                            {roleOption.label}
                        </option>
                    ))}
                </select>
                {errors.role && (
                    <p className="error-message">{errors.role}</p>
                )}
            </div>

            {/* Password Fields - Only show for create mode */}
            {!initialValues.id && (
                <>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        clearFieldError('password');
                                    }}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="error-message">{errors.password}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        clearFieldError('confirmPassword');
                                    }}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="error-message">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Form Actions */}
            <div className="form-actions">
                <button
                    type="button"
                    className="secondary-button"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="primary-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : submitButtonText}
                </button>
            </div>
        </form>
    );
}

export default UserForm;