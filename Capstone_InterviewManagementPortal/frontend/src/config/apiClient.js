/* API Client: centralizes HTTP client configuration for backend communication. */

import axios from "axios";
import { getSession, clearSession } from "../utils/session";


const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/* Attach basic authentication credentials to every outgoing request when a valid user session exists.*/
const attachAuthorizationHeader = (config) => {
    const session = getSession();
    if (session?.email && session?.password) {
        const token = btoa(`${session.email}:${session.password}`);
        config.headers.Authorization = `Basic ${token}`;
    }
    return config;
};

/* Normalize API errors and clear the current session when authentication expires or becomes invalid. */
const normalizeFastApiDetail = (detail) => {
    // detail: [ { loc, msg, type }, ... ] (FastAPI default)
    if (!Array.isArray(detail)) return "";

    const messages = detail
        .map((d) => d?.msg || d?.message)
        .filter(Boolean);

    return messages.join("; ");
};

const handleResponseError = (error) => {
    if (error.response?.status === 401) {
        clearSession();
        window.location.href = "/login";
    }

    // Only show generic connectivity error when backend is unreachable / network failure.
    // Axios: for network failures error.response is undefined.
    if (!error.response) {
        if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
            return Promise.reject(new Error("Unable to reach the server. Please check the backend connection and try again."));
        }
        return Promise.reject(new Error("Unable to reach the server. Please check the backend connection and try again."));
    }

    const data = error.response?.data;

    // Priority:
    // 1) detail (FastAPI HTTPException): { detail: ... }
    // 2) message: { message: ... }
    // 3) Pydantic validation errors (422): { detail: [ { msg, ... }, ... ] }
    let message = "";

    if (typeof data?.detail === "string") {
        message = data.detail;
    } else if (Array.isArray(data?.detail)) {
        // FastAPI default validation errors: { detail: [ { loc, msg, type }, ... ] }
        message = normalizeFastApiDetail(data.detail);
    }

    if (!message && typeof data?.message === "string") {
        message = data.message;
    }

    if (!message) message = error.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
};

apiClient.interceptors.request.use(attachAuthorizationHeader, Promise.reject);
apiClient.interceptors.response.use((response) => response, handleResponseError);

export default apiClient;