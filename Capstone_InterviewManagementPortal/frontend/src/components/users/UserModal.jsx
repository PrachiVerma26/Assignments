// Reusable modal component for creating and editing users with validation
import { useState, useEffect } from "react";
import { createUser, updateUser } from "../../services/userService";
import "./UserModal.css";

function UserModal({ mode, isOpen, onClose, onSuccess, selectedUser }) {
    // Form state
    const [formData, setFormData] = useState({name: "", email: "", role: ""});
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const roleOptions = [
        { value: "ADMIN", label: "Admin" },
        { value: "HR", label: "HR" },
        { value: "INTERVIEWER", label: "Interviewer" }
    ];

    // Initialize form data based on mode
    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && selectedUser) {
                setFormData({name: selectedUser.name || "", email: selectedUser.email || "", role: selectedUser.role || ""});
            } else {
                setFormData({ name: "", email: "", role: ""});
            }
            setErrors({});
            setTouched({});
            setApiError("");
        }
    }, [isOpen, mode, selectedUser]);

    // Focus on name field when modal opens for better UX
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                const nameInput = document.getElementById("user-name");
                if (nameInput) {
                    nameInput.focus();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const validateName = (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) {return "Name is required.";}
        if (trimmedValue.length < 2) { return "Name must be at least 2 characters long.";}
        if (trimmedValue.length > 100) {return "Name cannot exceed 100 characters.";}
        if (!/^[a-zA-Z\s]+$/.test(trimmedValue)) {return "Name can only contain letters and spaces.";}
        if (trimmedValue !== trimmedValue.replace(/\s+/g, ' ')) {return "Name cannot have multiple consecutive spaces.";}
        if (trimmedValue.startsWith(' ') || trimmedValue.endsWith(' ')) {return "Name cannot start or end with spaces.";}
    
        return null;
    };

    const validateEmail = (value) => {
        const trimmedValue = value.trim();    
        if (!trimmedValue) {return "Email is required.";}
        if (trimmedValue.length > 100) {return "Email cannot exceed 100 characters.";}
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) {return "Please enter a valid email address.";}
        
        return null;
    };

    const validateRole = (value) => {
        if (!value) {return "Role is required.";}
        return null;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
        // Clear API error when user starts typing
        if (apiError) {setApiError("");}
        // Only validate if field has been touched to avoid premature errors
        if (touched[field]) {
            let error = null;
            switch (field) {
                case "name":
                    error = validateName(value);
                    break;
                case "email":
                    error = validateEmail(value);
                    break;
                case "role":
                    error = validateRole(value);
                    break;
                default:
                    break;
            }
            setErrors(prev => ({...prev, [field]: error}));
        }
    };

    const handleFieldBlur = (field) => {
        setTouched(prev => ({...prev, [field]: true}));
        let error = null;
        switch (field) {
            case "name":
                error = validateName(formData[field]);
                break;
            case "email":
                error = validateEmail(formData[field]);
                break;
            case "role":
                error = validateRole(formData[field]);
                break;
            default:
                break;
        }
        setErrors(prev => ({...prev, [field]: error }));
    };

    const validateForm = () => {
        const formErrors = {
            name: validateName(formData.name),
            email: validateEmail(formData.email),
            role: validateRole(formData.role)
        };
        setErrors(formErrors);
        setTouched({name: true, email: true, role: true});

        return Object.values(formErrors).every(error => error === null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            setIsLoading(true);
            setApiError("");
            const userData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                role: formData.role
            };
            if (mode === "create") {
                await createUser(userData);
            } else {
                await updateUser(selectedUser.id, userData);
            }
            onSuccess();
            handleClose();
        } catch (error) {
            setApiError(error.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({name: "", email: "", role: ""});
        setErrors({});
        setTouched({});
        setApiError("");
        onClose();
    };
    // Handle keyboard shortcuts and prevent body scroll
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && isOpen) {
                handleClose();
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            handleClose();
        }
    };
    if (!isOpen) {
        return null;
    }

    const isCreateMode = mode === "create";
    const modalTitle = isCreateMode ? "Create User" : "Edit User";
    const submitButtonText = isCreateMode ? "Create User" : "Save Changes";

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="user-modal">
                <div className="modal-header">
                    <h2 className="modal-title">{modalTitle}</h2>
                    <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Close modal">✕</button>
                </div>
                <form className="user-form" onSubmit={handleSubmit}>
                    {apiError && (<div className="api-error">{apiError}</div>)}
                    <div className="form-group">
                        <label htmlFor="user-name" className="form-label">Name <span className="required-asterisk">*</span></label>
                        <input
                            id="user-name"
                            type="text"
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            placeholder="Enter user name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            onBlur={() => handleFieldBlur("name")}
                            disabled={isLoading}
                        />{touched.name && errors.name && (<p className="error-message">{errors.name}</p>)}
                    </div>
                    <div className="form-group">
                        <label htmlFor="user-email" className="form-label">Email <span className="required-asterisk">*</span></label>
                        <input
                            id="user-email"
                            type="email"
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            onBlur={() => handleFieldBlur("email")}
                            disabled={isLoading}/>
                        {touched.email && errors.email && (<p className="error-message">{errors.email}</p>)}
                    </div>
                    <div className="form-group">
                        <label htmlFor="user-role" className="form-label">Role <span className="required-asterisk">*</span></label>
                        <select
                            id="user-role"
                            className={`form-select ${errors.role ? 'error' : ''}`}
                            value={formData.role}
                            onChange={(e) => handleInputChange("role", e.target.value)}
                            onBlur={() => handleFieldBlur("role")}
                            disabled={isLoading}>
                            <option value="">Select role</option>
                            {roleOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select>
                        {touched.role && errors.role && (<p className="error-message">{errors.role}</p>)}
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={handleClose} disabled={isLoading}>Cancel</button>
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? "Processing..." : submitButtonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default UserModal;