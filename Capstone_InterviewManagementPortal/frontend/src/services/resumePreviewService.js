import { getCandidateById, viewResume } from "./candidateService";

export const loadResumePreview = async (candidateId) => {
    const [candidateData, pdfBlob] = await Promise.all([
        getCandidateById(candidateId),
        viewResume(candidateId),
    ]);

    return { candidateData, pdfBlob };
};

