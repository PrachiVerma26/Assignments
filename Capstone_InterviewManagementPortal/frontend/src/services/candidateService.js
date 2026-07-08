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

export const uploadResume = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post(`${CANDIDATE_ENDPOINTS.UPLOAD_RESUME}/${id}/resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const getResumeUrl = (id) =>
    `${CANDIDATE_ENDPOINTS.GET_RESUME}/${id}/resume`;

export const updateCandidateStatus = async (id, newStatus) => {
    const response = await axiosInstance.patch(
        `${CANDIDATE_ENDPOINTS.UPDATE_STATUS}/${id}/status`,
        null,
        { params: { new_status: newStatus } }
    );
    return response.data;
};

export const getStatusHistory = async (id) => {
    const response = await axiosInstance.get(`${CANDIDATE_ENDPOINTS.GET_STATUS_HISTORY}/${id}/status/history`);
    return response.data;
};
