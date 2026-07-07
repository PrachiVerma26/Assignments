// User Service: Handles all user management API communication
import { API_BASE_URL, USER_ENDPOINTS } from "../config/api";
import { getSession } from "../utils/session";
import axios from "axios";
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

export const getUsers = async ({ page = 1, limit = 10, search = "", active = null, role = "" } = {}) => {
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
        if (role) {
            params.append("role", role);
        }
        const response = await axios.get(
            `${API_BASE_URL}${USER_ENDPOINTS.LIST_USERS}?${params.toString()}`,
            { headers: getAuthHeaders()}
        );
        const data = response.data;

        // Transform to include total count for pagination
        return {
            message: data.message,
            users: data.users || [],
            total: data.users ? data.users.length : 0, 
            page,
            limit
        };
    } catch (error) {
        if (!error.response) {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }
        throw  new Error( error.response?.data?.detail || error.response?.data?.message || "Failed to fetch users.");
    }
};

export const createUser = async (userData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}${USER_ENDPOINTS.CREATE_USER}`, userData,
            {
                headers: getAuthHeaders()
            }
        );
        return response.data;
    } catch (error) {
        if (!error.message) {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }
        throw new Error( error.response?.data?.detail || error.response?.data?.message || "Failed to fetch users.");
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}${USER_ENDPOINTS.UPDATE_USER}/${userId}`, userData,
            { 
                headers: getAuthHeaders(),
            }
        );
        return response.data;
    } catch (error) {
        if (!error.message) {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }
        throw new Error( error.response?.data?.detail || error.response?.data?.message || "Failed to update users.");
    }
};

export const updateUserStatus = async (userId, status) => {
    try {
        const params = new URLSearchParams();
        params.append("status", status);
        const response = await axios.patch(
            `${API_BASE_URL}${USER_ENDPOINTS.UPDATE_STATUS}/${userId}/status?${params.toString()}`, null,
            {
                headers: getAuthHeaders()
            }
        );
        return response.data;
    } catch (error) {
        if (!error.message) {
            throw new Error("Unable to connect to the server. Please ensure the backend is running.");
        }
        throw new Error( error.response?.data?.detail || error.response?.data?.message || "Failed to update user status.");
    }
};

//the unified updateUserStatus
export const disableUser = async (userId) => {
    return updateUserStatus(userId, "INACTIVE");
};

export const enableUser = async (userId) => {
    return updateUserStatus(userId, "ACTIVE");
};