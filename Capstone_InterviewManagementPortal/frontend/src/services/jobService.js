// Job Service: All job API calls via centralized axios instance
import axiosInstance from "../config/axios";
import { JOB_ENDPOINTS } from "../config/api";

export const getJobs = async ({ page = 1, limit = 10, search = "" } = {}) => {
    const params = { page, limit };
    if (search.trim()) params.search = search.trim();
    const response = await axiosInstance.get(JOB_ENDPOINTS.LIST_JOBS, { params });
    return response.data;
};

export const getJobById = async (id) => {
    const response = await axiosInstance.get(`${JOB_ENDPOINTS.GET_JOB}/${id}`);
    return response.data;
};

export const createJob = async (jobData) => {
    const response = await axiosInstance.post(JOB_ENDPOINTS.CREATE_JOB, jobData);
    return response.data;
};

export const updateJob = async (id, jobData) => {
    const response = await axiosInstance.put(`${JOB_ENDPOINTS.UPDATE_JOB}/${id}`, jobData);
    return response.data;
};
