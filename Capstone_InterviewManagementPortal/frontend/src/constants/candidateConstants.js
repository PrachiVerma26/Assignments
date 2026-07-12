export const EMPTY_FORM = {
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    current_company: "",
    experience_years: "",
    experience_months: "",
    applied_job_id: "",
};

export const STATUS_OPTIONS = [
    { value: "PROFILE_CREATED", label: "Profile Created" },
    { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
    { value: "INTERVIEW_COMPLETED", label: "Interview Completed" },
    { value: "SELECTED", label: "Selected" },
    { value: "REJECTED", label: "Rejected" },
];

export const CANDIDATES_PER_PAGE = 5;
export const STATUS_LABELS = {
    PROFILE_CREATED: "Profile Created",
    INTERVIEW_SCHEDULED: "Interview Scheduled",
    INTERVIEW_COMPLETED: "Interview Completed",
    SELECTED: "Selected",
    REJECTED: "Rejected",
};