// User Service: Handles all user management API communication
import { API_BASE_URL, USER_ENDPOINTS } from "../config/api";
import { getSession } from "../utils/session";

const getAuthHeaders = () => {
    const session = getSession();
    if (!session || !session.email || !session.password) {
        throw new Error("No valid session found. Please login again.");
    }
    const basicToken = btoa(`${session.email}:${session.password}`);
    return {
        "Content-Type": "application/json",
        "Authorization": `Basic ${basicToken}`,
    };
};

export const getUsers = async ({ page = 1, limit = 10, search = "", active = null } = {}) => {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search && search.trim()) {
            params.append("search", search.trim());
        }
        if (active !== null) {
            params.append("active", active.toString());
        }
        const response = await fetch(
            `${API_BASE_URL}${USER_ENDPOINTS.LIST_USERS}?${params.toString()}`,
            {
                method: "GET",
                headers: getAuthHeaders(),
            }
        );
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || data.message || "Failed to fetch users.");
        }
        // Transform to include total count for pagination
        return {
            message: data.message,
            users: data.users || [],
            total: data.users ? data.users.length : 0, 
            page: page,
            limit: limit
        };

    } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}${USER_ENDPOINTS.CREATE_USER}`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(userData),
            }
        );
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || data.message || "Failed to create user.");
        }
        return data;
    } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}${USER_ENDPOINTS.UPDATE_USER}/${userId}`,
            {
                method: "PUT", 
                headers: getAuthHeaders(),
                body: JSON.stringify(userData),
            }
        );
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || data.message || "Failed to update user.");
        }
        return data;
    } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }
        throw error;
    }
};

export const updateUserStatus = async (userId, status) => {
    try {
        const params = new URLSearchParams();
        params.append("status", status);
        const response = await fetch(
            `${API_BASE_URL}${USER_ENDPOINTS.UPDATE_STATUS}/${userId}/status?${params.toString()}`,
            {
                method: "PATCH",
                headers: getAuthHeaders(),
            }
        );
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || data.message || "Failed to update user status.");
        }
        return data;

    } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }
        throw error;
    }
};

//the unified updateUserStatus
export const disableUser = async (userId) => {
    return updateUserStatus(userId, "INACTIVE");
};

export const enableUser = async (userId) => {
    return updateUserStatus(userId, "ACTIVE");
};