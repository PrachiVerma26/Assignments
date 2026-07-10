import { Calendar } from "lucide-react";

function EmptyInterviewState() {
    return (
        <div className="iv-empty">
            <Calendar size={48} className="iv-empty-icon" />
            <h3 className="iv-empty-title">No Interviews Scheduled</h3>
            <p className="iv-empty-text">You haven't scheduled any interviews yet.</p>
        </div>
    );
}

export default EmptyInterviewState;
