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
    { value: "APPLIED", label: "Applied" },
    { value: "SHORTLISTED", label: "Shortlisted" },
    { value: "REJECTED", label: "Rejected" },
    { value: "HIRED", label: "Hired" },
];

export const CANDIDATES_PER_PAGE = 5;
export const STATUS_LABELS = {
    PROFILE_CREATED: "New",
    APPLIED: "Applied",
    SHORTLISTED: "Screening",
    REJECTED: "Rejected",
    HIRED: "Offered",
};