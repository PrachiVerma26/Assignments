import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { scheduleInterview, updateInterview, getSchedulingFormData } from "../../services/interviewService";
import { getSession } from "../../utils/session";
import {EMPTY_FORM} from "../../constants/interviewFormConstants";
function InterviewFormModal({ isOpen, onClose, onSuccess, mode = "create", interview = null }) {
    const session = getSession();
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [interviewers, setInterviewers] = useState([]);

    const isReschedule = mode === "reschedule";
    const isInterviewer = session?.role === "INTERVIEWER";

    useEffect(() => {
        if (!isOpen) return;
        setErrors({});
        setApiError("");
        if (isReschedule && interview) {
            setForm({
                candidate_id: interview.candidate?.id || "",
                interviewer_id: interview.interviewer?.id || "",
                interview_date: interview.interview_date || "",
                interview_time: interview.interview_time || "",
                interview_mode: interview.interview_mode || "",
                meeting_link: interview.meeting_link || "",
                location: interview.location || "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [isOpen, mode, interview, isReschedule]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen || isReschedule) return;
        const load = async () => {
            try {
                const data = await getSchedulingFormData();
                setCandidates(data.candidates || []);
                setInterviewers(data.interviewers || []);
            } catch {
                setApiError("Failed to load candidates and interviewers.");
            }
        };
        load();
    }, [isOpen, isReschedule]);

    useEffect(() => {
        if (!isOpen || !isReschedule) return;
        const load = async () => {
            try {
                const data = await getSchedulingFormData();
                setInterviewers(data.interviewers || []);
            } catch {
                setApiError("Failed to load interviewers.");
            }
        };
        load();
    }, [isOpen, isReschedule]);

    const validate = () => {
        const e = {};
        if (!isReschedule && !form.candidate_id) e.candidate_id = "Candidate is required.";
        if (!form.interview_date) e.interview_date = "Interview date is required.";
        if (!form.interview_time) e.interview_time = "Interview time is required.";
        if (!isReschedule || !isInterviewer) {
            if (!form.interview_mode) e.interview_mode = "Interview mode is required.";
            if (form.interview_mode === "ONLINE" && !form.meeting_link.trim()) e.meeting_link = "Meeting link is required for online interviews.";
            if (form.interview_mode === "OFFLINE" && !form.location.trim()) e.location = "Location is required for offline interviews.";
        }
        return e;
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
        if (apiError) setApiError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
        setIsLoading(true);
        setApiError("");
        try {
            if (isReschedule) {
                const payload = {
                    interview_date: form.interview_date,
                    interview_time: form.interview_time,
                };
                if (!isInterviewer) {
                    payload.interviewer_id = form.interviewer_id || undefined;
                    payload.interview_mode = form.interview_mode;
                    payload.meeting_link = form.meeting_link || null;
                    payload.location = form.location || null;
                }
                await updateInterview(interview.id, payload);
            } else {
                const payload = {
                    candidate_id: form.candidate_id,
                    interviewer_id: form.interviewer_id,
                    interview_date: form.interview_date,
                    interview_time: form.interview_time,
                    interview_mode: form.interview_mode,
                    meeting_link: form.meeting_link || null,
                    location: form.location || null,
                };
                await scheduleInterview(payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setApiError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="jf-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="jf-modal">
                <div className="jf-header">
                    <h2 className="jf-title">{isReschedule ? "Reschedule Interview" : "Schedule Interview"}</h2>
                    <button className="jf-close" onClick={onClose}><X size={18} /></button>
                </div>
                <form className="jf-form" onSubmit={handleSubmit} noValidate>
                    {apiError && <div className="jf-api-error">{apiError}</div>}

                    {!isReschedule && (
                        <div className="jf-row">
                            <div className="jf-group">
                                <label className="jf-label">Candidate <span className="jf-req">*</span></label>
                                <select className={`jf-input${errors.candidate_id ? " error" : ""}`} value={form.candidate_id} onChange={e => handleChange("candidate_id", e.target.value)} disabled={isLoading}>
                                    <option value="">Select candidate</option>
                                    {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.candidate_id && <p className="jf-error-msg">{errors.candidate_id}</p>}
                            </div>
                            <div className="jf-group">
                                <label className="jf-label">Interviewer</label>
                                <select className="jf-input" value={form.interviewer_id} onChange={e => handleChange("interviewer_id", e.target.value)} disabled={isLoading}>
                                    <option value="">Select interviewer</option>
                                    {interviewers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {isReschedule && !isInterviewer && (
                        <div className="jf-row">
                            <div className="jf-group">
                                <label className="jf-label">Interviewer</label>
                                <select className="jf-input" value={form.interviewer_id} onChange={e => handleChange("interviewer_id", e.target.value)} disabled={isLoading}>
                                    <option value="">Select interviewer</option>
                                    {interviewers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="jf-row">
                        <div className="jf-group">
                            <label className="jf-label">Interview Date <span className="jf-req">*</span></label>
                            <input type="date" className={`jf-input${errors.interview_date ? " error" : ""}`} value={form.interview_date} onChange={e => handleChange("interview_date", e.target.value)} disabled={isLoading} />
                            {errors.interview_date && <p className="jf-error-msg">{errors.interview_date}</p>}
                        </div>
                        <div className="jf-group">
                            <label className="jf-label">Interview Time <span className="jf-req">*</span></label>
                            <input type="time" className={`jf-input${errors.interview_time ? " error" : ""}`} value={form.interview_time} onChange={e => handleChange("interview_time", e.target.value)} disabled={isLoading} />
                            {errors.interview_time && <p className="jf-error-msg">{errors.interview_time}</p>}
                        </div>
                    </div>

                    {(!isReschedule || !isInterviewer) && (
                        <div className="jf-row">
                            <div className="jf-group">
                                <label className="jf-label">Interview Mode <span className="jf-req">*</span></label>
                                <select className={`jf-input${errors.interview_mode ? " error" : ""}`} value={form.interview_mode} onChange={e => handleChange("interview_mode", e.target.value)} disabled={isLoading}>
                                    <option value="">Select mode</option>
                                    <option value="ONLINE">Online</option>
                                    <option value="OFFLINE">Offline</option>
                                </select>
                                {errors.interview_mode && <p className="jf-error-msg">{errors.interview_mode}</p>}
                            </div>
                            {form.interview_mode === "ONLINE" && (
                                <div className="jf-group">
                                    <label className="jf-label">Meeting Link <span className="jf-req">*</span></label>
                                    <input className={`jf-input${errors.meeting_link ? " error" : ""}`} placeholder="https://..." value={form.meeting_link} onChange={e => handleChange("meeting_link", e.target.value)} disabled={isLoading} />
                                    {errors.meeting_link && <p className="jf-error-msg">{errors.meeting_link}</p>}
                                </div>
                            )}
                            {form.interview_mode === "OFFLINE" && (
                                <div className="jf-group">
                                    <label className="jf-label">Location <span className="jf-req">*</span></label>
                                    <input className={`jf-input${errors.location ? " error" : ""}`} placeholder="e.g. Office - Room 3" value={form.location} onChange={e => handleChange("location", e.target.value)} disabled={isLoading} />
                                    {errors.location && <p className="jf-error-msg">{errors.location}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="jf-actions">
                        <button type="button" className="jf-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
                        <button type="submit" className="jf-submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : isReschedule ? "Update Interview" : "Schedule Interview"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InterviewFormModal;