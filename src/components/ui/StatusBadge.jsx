const statusColorsMap = {
  // Project statuses
  "On Track": { bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  "Awaiting Review": { bg: "bg-amber-50 border-amber-200 text-amber-700" },
  Paused: { bg: "bg-red-50 border-red-200 text-red-700" },
  "Needs Help": { bg: "bg-purple-50 border-purple-200 text-purple-700" },
  // Task statuses
  "Revision Needed": { bg: "bg-red-50 border-red-200 text-red-700" },
  "To Do": { bg: "bg-slate-100 border-slate-200 text-slate-700" },
  "In Progress": { bg: "bg-blue-50 border-blue-200 text-blue-700" },
  "Under Review": { bg: "bg-amber-50 border-amber-200 text-amber-700" },
  Completed: { bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  // Milestone statuses
  UPCOMING: { bg: "bg-slate-100 border-slate-200 text-slate-700" },
  IN_PROGRESS: { bg: "bg-blue-50 border-blue-200 text-blue-700" },
  COMPLETED: { bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  OVERDUE: { bg: "bg-red-50 border-red-200 text-red-700" },
};

export default function StatusBadge({ status }) {
  const s = statusColorsMap[status] || { bg: "bg-slate-100 border-slate-200 text-slate-700" };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border ${s.bg}`}
    >
      {status}
    </span>
  );
}
