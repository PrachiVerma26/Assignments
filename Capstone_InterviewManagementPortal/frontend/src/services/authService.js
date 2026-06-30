// Authentication Service: Handles all authentication-related API communication
import { API_BASE_URL, AUTH_ENDPOINTS } from "../config/api";

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
        if (error instanceof TypeError && error.message === "Failed to fetch"
        ) {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }

        throw error;
    }
};

export const resetPassword = async ({email, currentPassword, newPassword}) => {
    try {
        // Generate HTTP Basic Authentication token
        const basicToken = btoa(`${email}:${currentPassword}`);

        const response = await fetch(
            `${API_BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`,
            {
                method: "POST",

                headers: {
                    Authorization: `Basic ${basicToken}`,
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({new_password: newPassword}),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message ||data.detail ||"Password reset failed.");
        }

        return data;

    } catch (error) {
        if (error.name === "TypeError" && error.message === "Failed to fetch") {
            throw new Error("Unable to connect to server.");
        }

        throw error;
    }
};