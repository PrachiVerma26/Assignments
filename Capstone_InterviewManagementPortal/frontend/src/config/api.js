/** API Configuration: Centralizes all backend API configuration.*/
export const API_BASE_URL = "http://localhost:8000";

/**Authentication API endpoints.*/
export const AUTH_ENDPOINTS = {
    LOGIN: "/auth/login",
    RESET_PASSWORD: "/auth/reset-password"
};

/* User Management API endpoints.*/
export const USER_ENDPOINTS = {
    LIST_USERS: "/users",
    CREATE_USER: "/users",
    GET_USER: "/users",
    UPDATE_USER: "/users",
    UPDATE_STATUS: "/users",
};

/* Job Management API endpoints.*/
export const JOB_ENDPOINTS = {
    LIST_JOBS: "/jobs",
    GET_JOB: "/jobs",
    CREATE_JOB: "/jobs",
    UPDATE_JOB: "/jobs",
};

/* Candidate Management API endpoints.*/
export const CANDIDATE_ENDPOINTS = {
    LIST_CANDIDATES: "/candidates",
    GET_CANDIDATE: "/candidates",
    CREATE_CANDIDATE: "/candidates",
    UPDATE_CANDIDATE: "/candidates",
};