import { CANDIDATE_ENDPOINTS } from "../config/api";
import apiClient from "../config/apiClient";

export const getCandidates = async ({ page = 1, limit = 10, search = "" } = {}) => {
    const params = { page, limit };
    if (search.trim()) params.search = search.trim();
    const response = await apiClient.get(CANDIDATE_ENDPOINTS.CANDIDATES, { params });
    return response.data;
};

export const getCandidateById = async (candidateId) => {
    const response = await apiClient.get(`${CANDIDATE_ENDPOINTS.CANDIDATES}/${candidateId}`);
    return response.data;
};

export const createCandidate = async (data) => {
    const response = await apiClient.post(CANDIDATE_ENDPOINTS.CANDIDATES, data);
    return response.data;
};

export const updateCandidate = async (candidateId, candidateData) => {
    const response = await apiClient.put(`${CANDIDATE_ENDPOINTS.CANDIDATES}/${candidateId}`, candidateData);
    return response.data;
};
