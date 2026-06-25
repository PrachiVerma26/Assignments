/** Login Page: Responsible for rendering the authentication screen, validating user input and initiating the login process.*/

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../../services/authService";
import { saveSession } from "../../utils/session";

import "./Login.css";

function Login() {
    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Password Visibility State
    const [showPassword, setShowPassword] = useState(false);

    // Validation & API Error State
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");

    // Loading State
    const [isLoading, setIsLoading] = useState(false);

    // React Router navigation
    const navigate = useNavigate();

    /** Validates login form.
     * @returns {boolean}
     */
    const validateForm = () => {
        const validationErrors = {};

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            validationErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            validationErrors.email = "Please enter a valid email address.";
        }

        if (!password.trim()) {
            validationErrors.password ="Password is required.";
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    /** Handles login submission.*/
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Clear previous API errors
        setApiError("");

        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            const response = await login({
                email: email.trim(),
                password,
            });

            // Save authenticated user details
            saveSession({
                id: response.id,
                name: response.name,
                email: response.email,
                role: response.role,
                status: response.status,
            });

            // Redirect to dashboard
            navigate("/dashboard");
        } catch (error) {
            setApiError(
                error.message || "Unable to sign in."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h1>Interview Management Portal</h1>
                <p className="login-subtitle"> Sign in to your account</p>

                {/* API Error */}
                {apiError && (<p className="api-error">{apiError} </p>)}

                {/* Email */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>

                    <input id="email" type="email" placeholder="Enter your email" value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setErrors((previous) => ({
                                ...previous,
                                email: "",
                            }));
                        }}
                    />

                    {errors.email && (
                        <p className="error-message">{errors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div className="form-group">
                    <div className="form-label-row">
                        <label htmlFor="password">Password</label>
                        <Link to="/reset-password" className="forgot-password">Reset Password</Link>
                    </div>

                    <div className="password-input-wrapper">
                        <input id="password" type={ showPassword ? "text": "password"} placeholder="Enter your password" value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                setErrors((previous) => ({
                                    ...previous,
                                    password: "",
                                }));
                            }}
                        />

                        <button type="button" className="toggle-password" onClick={() =>setShowPassword((previous) => !previous )}>
                            {showPassword? "Hide": "Show"}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="error-message">{errors.password}</p>
                    )}
                </div>

                <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading? "Signing In...": "Sign In"}
                </button>

                <p className="login-footer">For account access,{" "}
                    <a href="mailto:admin@nucleusteq.com">contact your administrator</a>
                </p>
            </form>
        </div>
    );
}

export default Login;