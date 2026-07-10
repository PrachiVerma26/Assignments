import { CANDIDATE_ENDPOINTS } from "../config/api";
import apiClient from "../config/apiClient";

export const getCandidates = async ({ page = 1, limit = 10, search = "" } = {}) => {
    const params = { page, limit };
    if (search.trim()) params.search = search.trim();
    const response = await apiClient.get(`${CANDIDATE_ENDPOINTS.CANDIDATES}/`, { params });
    return response.data;
};

export const getCandidateById = async (candidateId) => {
    const response = await apiClient.get(`${CANDIDATE_ENDPOINTS.CANDIDATES}/${candidateId}`);
    return response.data;
};

export const createCandidate = async (data) => {
    const response = await apiClient.post(`${CANDIDATE_ENDPOINTS.CANDIDATES}/`, data);
    return response.data;
};

export const updateCandidate = async (candidateId, candidateData) => {
    const response = await apiClient.put(`${CANDIDATE_ENDPOINTS.CANDIDATES}/${candidateId}`, candidateData);
    return response.data;
};

export const uploadResume = async (candidateId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(CANDIDATE_ENDPOINTS.RESUME(candidateId), formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const viewResume = async (candidateId) => {
    const response = await apiClient.get(CANDIDATE_ENDPOINTS.RESUME(candidateId), {
        responseType: "blob",
    });
    return response.data;
};

export const updateCandidateStatus = async (candidateId, newStatus) => {
    const response = await apiClient.patch(CANDIDATE_ENDPOINTS.STATUS(candidateId), null, {
        params: { new_status: newStatus },
    });
    return response.data;
};

export const getCandidateStatusHistory = async (candidateId) => {
    const response = await apiClient.get(CANDIDATE_ENDPOINTS.STATUS_HISTORY(candidateId));
    return response.data;
};