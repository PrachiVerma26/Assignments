/**Authentication Service: Handles all authentication-related API communication.*/

import apiClient from "../config/apiClient";
import { AUTH_ENDPOINTS } from "../config/api";

export const login = async (credentials) => {
    const response = await apiClient.post(
        AUTH_ENDPOINTS.LOGIN,
        credentials
    );
    return response.data;
};

export const resetPassword = async ({email, currentPassword, newPassword}) => {
    // Generate HTTP Basic Authentication token
    const basicToken = btoa(`${email}:${currentPassword}`);
    const response = await apiClient.post(
        AUTH_ENDPOINTS.RESET_PASSWORD,
        {
            old_password: currentPassword,
            new_password: newPassword
        },
        {    
            headers: {
                Authorization: `Basic ${basicToken}`,
            },
        }
    );
    return response.data;
};