/* ==========================================================================
   StatusBadge — renders a workflow status as a coloured pill.
   --------------------------------------------------------------------------
   Prop is unchanged: { status }. Every key that existed before still maps to
   the same semantic colour, so no call site changes meaning.

   Colour alone is never the only signal — each pill also carries a leading
   dot whose tone reinforces the state for low-contrast / colour-blind
   viewing, and the label itself always spells the status out.
   ========================================================================== */

const tones = {
  neutral: "bg-slate-50   text-slate-700   border-slate-200",
  info:    "bg-info-50    text-info-700    border-info-200",
  success: "bg-success-50 text-success-700 border-success-200",
  warning: "bg-warning-50 text-warning-700 border-warning-200",
  danger:  "bg-danger-50  text-danger-700  border-danger-200",
  brand:   "bg-brand-50   text-brand-700   border-brand-200",
};

const statusTone = {
  // Project statuses
  "On Track":         "success",
  "Awaiting Review":  "warning",
  Paused:             "danger",
  "Needs Help":       "brand",
  // Task statuses
  "Revision Needed":  "danger",
  "To Do":            "neutral",
  "In Progress":      "info",
  "Under Review":     "warning",
  Completed:          "success",
  // Milestone statuses
  UPCOMING:           "neutral",
  IN_PROGRESS:        "info",
  COMPLETED:          "success",
  OVERDUE:            "danger",
};

export default function StatusBadge({ status }) {
  const tone = tones[statusTone[status]] || tones.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border
        text-[11px] font-semibold whitespace-nowrap ${tone}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-70" aria-hidden="true" />
      {status}
    </span>
  );
}
