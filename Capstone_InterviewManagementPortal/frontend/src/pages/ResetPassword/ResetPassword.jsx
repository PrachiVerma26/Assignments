/** Reset Password Page: Allows users to reset their password after verifying
their current credentials using HTTP Basic Authentication.*/

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import "./ResetPassword.css";

function ResetPassword() {
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const validationErrors = {};

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            validationErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            validationErrors.email ="Please enter a valid email address.";
        }

        if (!currentPassword.trim()) {
            validationErrors.currentPassword ="Current password is required.";
        }

        if (!newPassword.trim()) {
            validationErrors.newPassword ="New password is required.";
        }
        else if (newPassword.length < 8) {
            validationErrors.newPassword ="Password must be at least 8 characters.";
        }
        else if (newPassword.length > 50) {
            validationErrors.newPassword ="Password cannot exceed 50 characters.";
        }
        else if (!/[A-Z]/.test(newPassword)) {
            validationErrors.newPassword ="Password must contain at least one uppercase letter.";
        }
        else if (!/[a-z]/.test(newPassword)) {
            validationErrors.newPassword ="Password must contain at least one lowercase letter.";
        }
        else if (!/\d/.test(newPassword)) {
            validationErrors.newPassword ="Password must contain at least one digit.";
        }
        else if (!/[@$!%*?&]/.test(newPassword)) {
            validationErrors.newPassword ="Password must contain at least one special character.";
        }
        else if (newPassword === currentPassword) {
            validationErrors.newPassword ="New password must be different from the current password.";
        }

        if (!confirmPassword.trim()) {
            validationErrors.confirmPassword ="Please confirm your password.";
        } else if (newPassword !== confirmPassword) {
            validationErrors.confirmPassword ="Passwords do not match.";
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    /** Handles password reset.*/
    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError("");
        setSuccessMessage("");
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await resetPassword({email: email.trim(), currentPassword,newPassword});
            setSuccessMessage(response.message);
            setTimeout(() => {navigate("/login");}, 1500);
        } catch (error) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h1>Reset Password</h1>
                <p className="login-subtitle">Verify your current credentials and create a new password. </p>
                {apiError && (<p className="api-error"> {apiError}</p>)}
                {successMessage && (<p className="success-message">{successMessage}</p>)}

                <div className="form-group">
                    <label htmlFor="email"> Email</label>
                    <input id="email" type="email" placeholder="Enter your email" value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setErrors((previous) => ({...previous, email: ""}));
                        }}
                    />

                    {errors.email && (<p className="error-message">{errors.email}</p>)}
                </div>

                <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <div className="password-input-wrapper">
                        <input id="currentPassword"
                            type={ showCurrentPassword? "text": "password"}
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(event) => {
                                setCurrentPassword(event.target.value);
                                setErrors((previous) => ({...previous, currentPassword: ""}));
                            }}
                        />

                        <button type="button" className="toggle-password"
                            onClick={() =>setShowCurrentPassword((previous) => !previous)}>{showCurrentPassword? "Hide": "Show"}
                        </button>
                    </div>
                    {errors.currentPassword && (<p className="error-message">{errors.currentPassword}</p>)}
                </div>

                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="password-input-wrapper">
                        <input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(event) => {
                                setNewPassword(event.target.value);
                                setErrors((previous) => ({...previous, newPassword: ""}));
                            }}
                        />

                        <button type="button" className="toggle-password"
                            onClick={() =>setShowNewPassword((previous) => !previous)}>{showNewPassword? "Hide": "Show"}
                        </button>
                    </div>
                    {errors.newPassword && (<p className="error-message">{errors.newPassword}</p>)}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="password-input-wrapper">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword? "text": "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(event) => {
                                setConfirmPassword(event.target.value);
                                setErrors((previous) => ({...previous, confirmPassword: ""}));
                            }}
                        />
                        <button type="button" className="toggle-password"
                            onClick={() =>setShowConfirmPassword((previous) => !previous)}>
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    {errors.confirmPassword && (<p className="error-message">{errors.confirmPassword}</p>)}
                </div>
                <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? "Resetting...": "Reset Password"}
                </button>
                <p className="login-footer"> Back to{" "}<Link to="/login">Sign In</Link></p>
            </form>
        </div>
    );
}
export default ResetPassword;