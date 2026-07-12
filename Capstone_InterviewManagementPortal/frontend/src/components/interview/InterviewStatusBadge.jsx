function InterviewStatusBadge({ status }) {
    return <span className={`iv-status iv-status--${status?.toLowerCase()}`}>{status}</span>;
}

export default InterviewStatusBadge;