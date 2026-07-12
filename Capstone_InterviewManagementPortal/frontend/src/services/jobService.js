// Job Service: All job API calls via centralized axios instance
import apiClient from "../config/apiClient";
import { JOB_ENDPOINTS } from "../config/api";

export const getJobs = async ({ page = 1, limit = 10, search = "", location = "" } = {}) => {
    const params = { page, limit };
    if (search.trim()) params.search = search.trim();
    if (location && location.trim()) params.location = location.trim();
    const response = await apiClient.get(`${JOB_ENDPOINTS.JOBS}/`, { params });
    return response.data;
};

export const getJobById = async (jobId) => {
    const response = await apiClient.get(`${JOB_ENDPOINTS.JOBS}/${jobId}`);
    return response.data;
};

export const createJob = async (jobData) => {
    const response = await apiClient.post(`${JOB_ENDPOINTS.JOBS}/`, jobData);
    return response.data;
};

export const updateJob = async (jobId, jobData) => {
    const response = await apiClient.put(`${JOB_ENDPOINTS.JOBS}/${jobId}`, jobData);
    return response.data;
};