/**Authentication Service: Handles all authentication-related API communication.*/

import axios from "axios";
import { API_BASE_URL, AUTH_ENDPOINTS } from "../config/api";

export const login = async (credentials) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`,
            credentials,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    }catch (error) {
        if (error.code=== "ERR_NETWORK"  || (error instanceof TypeError && error.message === "Failed to fetch")
        ) {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }
        throw new Error(error.response?.data?.detail || error.response?.data?.message || "Login failed.");
    }
};

export const resetPassword = async ({email, currentPassword, newPassword}) => {
    try {
        // Generate HTTP Basic Authentication token
        const basicToken = btoa(`${email}:${currentPassword}`);
        const response = await axios.post(
            `${API_BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`,
            {
                new_password: newPassword,
            },
            {    headers: {
                    Authorization: `Basic ${basicToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        if (error.name ==="ERR_NETWORK" || (error instanceof TypeError && error.message === "Failed to fetch")) {
            throw new Error("Unable to connect to server.");
        }
        throw new Error(error.response?.data?.message || error.response?.data?.detail || "Password reset failed.");
    }
};