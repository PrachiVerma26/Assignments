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

/* Interview Management API endpoints. */
export const INTERVIEW_ENDPOINTS = {
    INTERVIEWS: "/interviews",
    INTERVIEW: (id) => `/interviews/${id}`,
    FEEDBACK: (id) => `/interviews/${id}/feedback`,
    HR_DASHBOARD: "/interviews/dashboard/hr",
    ADMIN_DASHBOARD: "/interviews/dashboard/admin",
    INTERVIEWER_DASHBOARD: "/interviews/dashboard/interviewer",
    SCHEDULING_FORM_DATA: "/interviews/form-data/scheduling",
};