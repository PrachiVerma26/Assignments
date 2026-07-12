import InterviewStatusBadge from "./InterviewStatusBadge";
import InterviewActions from "./InterviewActions";

function InterviewListTable({interviews, onReschedule, onViewFeedback, onViewDetails, canReschedule, canViewFeedback, actionsDisabled = false,}) {
    return (
        <table className="iv-table">
            <thead>
                <tr>
                    <th>Candidate</th>
                    <th>Interviewer</th>
                    <th>Job</th>
                    <th>Date &amp; Time</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {interviews.map((iv) => (
                    <tr key={iv.id}>
                        <td>{iv.candidate?.name}</td>
                        <td>{iv.interviewer?.name}</td>
                        <td>{iv.job?.title || "N/A"}</td>
                        <td> {iv.interview_date} {iv.interview_time} </td>
                        <td>{iv.interview_mode}</td>
                        <td><InterviewStatusBadge status={iv.status} /></td>
                        <td>
                            <InterviewActions
                                interview={iv}
                                onViewDetails={onViewDetails}
                                onReschedule={onReschedule}
                                onViewFeedback={onViewFeedback}
                                canReschedule={canReschedule ? canReschedule(iv) : true}
                                canViewFeedback={canViewFeedback ? canViewFeedback(iv) : true}
                                disabled={actionsDisabled}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default InterviewListTable;