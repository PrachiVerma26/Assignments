import ActionsMenu from "../actions/ActionsMenu";

function InterviewActions({ interview, onReschedule, onViewFeedback, onViewDetails, canReschedule = true, canViewFeedback = true, disabled = false,}) {
    return (
        <ActionsMenu
            items={[
                { label: "View Details", onClick: () => onViewDetails(interview), disabled },
                { label: "Reschedule", onClick: () => onReschedule(interview), hidden: !canReschedule, disabled },
                { label: "View Feedback", onClick: () => onViewFeedback(interview), hidden: !canViewFeedback, disabled },
            ]}
        />
    );
}

export default InterviewActions;