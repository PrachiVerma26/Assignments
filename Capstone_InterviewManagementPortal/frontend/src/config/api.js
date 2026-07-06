/** API Configuration: Centralizes all backend API configuration.*/

// Base URL of the FastAPI backend.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
/**
 * Authentication API endpoints.
 * These endpoints will be consumed by authService.js.
 * If an endpoint changes, update it here instead of searching through multiple service files.
 */
export const AUTH_ENDPOINTS = {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    RESET_PASSWORD: "/auth/reset-password",
};