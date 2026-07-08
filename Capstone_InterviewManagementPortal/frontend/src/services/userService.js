// User Service: Handles all user management API communication
import { USER_ENDPOINTS } from "../config/api";
import apiClient from "../config/apiClient";

export const getUsers = async ({page = 1, limit = 10, search = "", active = null, role = ""} = {}) => {
    const params = {page, limit};
    if (search.trim()) {
        params.search = search.trim();
    }
    if (active !== null) {
        params.active = active;
    }
    if (role) {
        params.role = role;
    }
    const response = await apiClient.get(
        USER_ENDPOINTS.USERS,
        { params }
    );
    return response.data;
};

export const createUser = async (userData) => {
    const response = await apiClient.post(
        USER_ENDPOINTS.USERS,
        userData
    );
    return response.data;
};

export const updateUser = async (userId, userData) => {
    const response = await apiClient.put(
        `${USER_ENDPOINTS.USERS}/${userId}`,
        userData
    );
    return response.data;
};

export const updateUserStatus = async (userId, status) => {
    const response = await apiClient.patch(
        `${USER_ENDPOINTS.USERS}/${userId}/status`, null,
        {
            params: {status},
        }
    );
    return response.data;
};

export const disableUser = async (userId) => {
    return updateUserStatus(userId, "INACTIVE");
};

export const enableUser = async (userId) => {
    return updateUserStatus(userId, "ACTIVE");
};