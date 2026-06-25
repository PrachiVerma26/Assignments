/**
 * Authentication Service: Handles all authentication-related API communication.
 * React components should use this service instead of directly calling the Fetch API.
 */

import { API_BASE_URL, AUTH_ENDPOINTS } from "../config/api";

/**
 * Authenticates a user.
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<Object>} Authenticated user details.
 */
export const login = async (credentials) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail ||data.message ||"Login failed.");
        }

        return data;

    } catch (error) {
        if (
            error instanceof TypeError &&
            error.message === "Failed to fetch"
        ) {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }

        throw error;
    }
};

/**
 * Sends a password reset request.
 * @param {Object} payload
 * @param {string} payload.email
 * @param {string} payload.newPassword
 * @returns {Promise<Object>} Password reset response.
 */
export const resetPassword = async ({
    email,
    newPassword,
}) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, new_password: newPassword}),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail ||data.message ||"Password reset failed.");
        }

        return data;

    } catch (error) {
        if (
            error instanceof TypeError &&
            error.message === "Failed to fetch"
        ) {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }

        throw error;
    }
};