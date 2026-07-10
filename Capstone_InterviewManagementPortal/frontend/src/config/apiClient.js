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
const handleResponseError = (error) => {
    if (error.response?.status === 401) {
        clearSession();
        window.location.href = "/login";
    }

    if (!error.response && error.code === "ERR_NETWORK") {
        return Promise.reject(new Error("Unable to reach the server. Please check the backend connection and try again."));
    }

    const message = error.response?.data?.detail || error.response?.data?.message || error.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
};

apiClient.interceptors.request.use(attachAuthorizationHeader, Promise.reject);
apiClient.interceptors.response.use((response) => response, handleResponseError);

export default apiClient;