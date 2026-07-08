/* API Configuration: Centralizes all backend API endpoint definitions. */

/* Authentication API endpoints.*/
export const AUTH_ENDPOINTS = {
    LOGIN: "/auth/login",
    RESET_PASSWORD: "/auth/reset-password",
};

/* User Management API endpoints.*/
export const USER_ENDPOINTS = {
    USERS: "/users",
};

/* Job Management API endpoints. */
export const JOB_ENDPOINTS = {
    JOBS: "/jobs",
};

/* Candidate Management API endpoints.*/
export const CANDIDATE_ENDPOINTS = {
    CANDIDATES: "/candidates",
    RESUME: (id) => `/candidates/${id}/resume`,
    STATUS: (id) => `/candidates/${id}/status`,
    STATUS_HISTORY: (id) => `/candidates/${id}/status/history`,
};