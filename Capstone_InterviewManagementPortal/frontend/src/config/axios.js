import axios from "axios";
import { getSession } from "../utils/session";
import { API_BASE_URL } from "./api";

const axiosInstance = axios.create({baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" }});

// Attach Basic Auth header from session before every request
axiosInstance.interceptors.request.use((config) => {
    const session = getSession();
    if (session?.email && session?.password) {
        const token = btoa(`${session.email}:${session.password}`);
        config.headers.Authorization = `Basic ${token}`;
    }
    return config;
});

// Normalize error messages from API responses
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Something went wrong.";
        return Promise.reject(new Error(message));
    }
);

export default axiosInstance;
