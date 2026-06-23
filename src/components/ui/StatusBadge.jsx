const statusColorsMap = {
  // Project statuses
  "On Track": { bg: "#dcfce7", text: "#16a34a" },
  "Awaiting Review": { bg: "#fef9c3", text: "#b45309" },
  Paused: { bg: "#fee2e2", text: "#dc2626" },
  "Needs Help": { bg: "#ede9fe", text: "#7c3aed" },
  // Task statuses
  "Revision Needed": { bg: "#fef2f2", text: "#ef4444" },
  "To Do": { bg: "#f1f5f9", text: "#64748b" },
  "In Progress": { bg: "#eff6ff", text: "#3b82f6" },
  "Under Review": { bg: "#fef3c7", text: "#d97706" },
  Completed: { bg: "#dcfce7", text: "#16a34a" },
};

export default function StatusBadge({ status }) {
  const s = statusColorsMap[status] || { bg: "#f1f5f9", text: "#64748b" };
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}
