import axiosInstance from "../config/axios";
import { CANDIDATE_ENDPOINTS } from "../config/api";

export const getCandidates = async ({ page = 1, limit = 10, search = "" } = {}) => {
    const params = { page, limit };
    if (search.trim()) params.search = search.trim();
    const response = await axiosInstance.get(CANDIDATE_ENDPOINTS.LIST_CANDIDATES, { params });
    return response.data;
};

export const getCandidateById = async (id) => {
    const response = await axiosInstance.get(`${CANDIDATE_ENDPOINTS.GET_CANDIDATE}/${id}`);
    return response.data;
};

export const createCandidate = async (data) => {
    const response = await axiosInstance.post(CANDIDATE_ENDPOINTS.CREATE_CANDIDATE, data);
    return response.data;
};

export const updateCandidate = async (id, data) => {
    const response = await axiosInstance.put(`${CANDIDATE_ENDPOINTS.UPDATE_CANDIDATE}/${id}`, data);
    return response.data;
};
