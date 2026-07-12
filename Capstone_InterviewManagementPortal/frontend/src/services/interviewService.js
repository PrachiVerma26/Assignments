import { INTERVIEW_ENDPOINTS } from "../config/api";
import apiClient from "../config/apiClient";

// Cache storage
const cache = {
    interviews: {},
    feedback: {},
    schedulingFormData: null,
    hrDashboard: null,
    interviewerDashboard: null,
};

// Debounce utility
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export const scheduleInterview = async (data) => {
    const response = await apiClient.post(`${INTERVIEW_ENDPOINTS.INTERVIEWS}/`, data);
    // Invalidate cache after scheduling
    cache.interviews = {};
    cache.schedulingFormData = null;
    cache.hrDashboard = null;
    return response.data;
};

export const getInterviews = async ({ page = 1, limit = 10, status = null } = {}) => {
    const key = `${page}_${limit}_${status || "all"}`;
    if (cache.interviews[key]) {
        return cache.interviews[key];
    }
    const params = { page, limit };
    if (status) params.status = status;
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.INTERVIEWS, { params });
    cache.interviews[key] = response.data;
    return response.data;
};

export const getInterviewById = async (id) => {
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.INTERVIEW(id));
    return response.data;
};

export const updateInterview = async (id, data) => {
    const response = await apiClient.put(INTERVIEW_ENDPOINTS.INTERVIEW(id), data);
    // Invalidate cache after update
    cache.interviews = {};
    cache.hrDashboard = null;
    cache.interviewerDashboard = null;
    return response.data;
};

export const submitFeedback = async (id, data) => {
    const response = await apiClient.post(INTERVIEW_ENDPOINTS.FEEDBACK(id), data);
    // Invalidate caches after feedback submission
    cache.interviews = {};
    delete cache.feedback[id];
    cache.hrDashboard = null;
    cache.interviewerDashboard = null;
    return response.data;
};

export const getFeedback = async (id) => {
    // Return cached feedback if available
    if (cache.feedback[id]) {
        return cache.feedback[id];
    }
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.FEEDBACK(id));
    cache.feedback[id] = response.data;
    return response.data;
};

export const getHRDashboard = async () => {
    if (cache.hrDashboard) {
        return cache.hrDashboard;
    }
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.HR_DASHBOARD);
    cache.hrDashboard = response.data;
    return response.data;
};

export const getAdminDashboard = async () => {
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.ADMIN_DASHBOARD);
    return response.data;
};

export const getInterviewerDashboard = async () => {
    if (cache.interviewerDashboard) {
        return cache.interviewerDashboard;
    }
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.INTERVIEWER_DASHBOARD);
    cache.interviewerDashboard = response.data;
    return response.data;
};

export const getSchedulingFormData = async () => {
    if (cache.schedulingFormData) {
        return cache.schedulingFormData;
    }
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.SCHEDULING_FORM_DATA);
    cache.schedulingFormData = response.data;
    return response.data;
};

// Interviewers endpoints (moved from interviewerService.js)
export const getInterviewers = async ({ page = 1, limit = 100, search = "" } = {}) => {
    const params = { page, limit };
    if (search.trim()) params.search = search.trim();
    // Backend route: /users/interviewers
    const response = await apiClient.get("/users/interviewers", { params });
    return response.data;
};


// Debounced search function for interview list
export const debouncedGetInterviews = debounce(getInterviews, 300);

// Cache invalidation utility
export const invalidateInterviewCache = () => {
    cache.interviews = {};
    cache.feedback = {};
    cache.schedulingFormData = null;
    cache.hrDashboard = null;
    cache.interviewerDashboard = null;
};
