import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useActivityStore } from "../../store/activityStore";
import { toast } from "react-toastify";
import { formatUIDate } from "../../lib/datetime";

// ── Action → human-readable label map ────────────────────────────────────────
export const ACTION_LABELS = {
  USER_INVITED:                   "invited a user",
  USER_LOGGED_IN:                 "logged in",
  PROJECT_CREATED:                "created project",
  PROJECT_UPDATED:                "updated project",
  PROJECT_DELETED:                "deleted project",
  TASK_CREATED:                   "created task",
  TASK_UPDATED:                   "updated task",
  TASK_STATUS_CHANGED:            "changed task status",
  SUBMISSION_CREATED:             "submitted work",
  SUBMISSION_APPROVED:            "approved submission",
  SUBMISSION_REVISION_REQUESTED:  "requested revision",
  MILESTONE_CREATED:              "created milestone",
  MILESTONE_COMPLETED:            "completed milestone",
  COMMENT_ADDED:                  "added a comment",
  TEMPLATE_CREATED:               "created a template",
};

/** Turns an ActivityLog entry into a readable sentence */
export function formatActivityLine(activity) {
  const actorName = activity.userId?.name || "Someone";
  const label = ACTION_LABELS[activity.action] || activity.action?.replace(/_/g, " ").toLowerCase();
  const title = activity.metadata?.title;
  return title
    ? `${actorName} ${label}: "${title}"`
    : `${actorName} ${label}`;
}

// ── Entity-type → icon / color chip ──────────────────────────────────────────
function getEntityMeta(entityType, action) {
  if (!entityType && action) {
    const a = action.toUpperCase();
    if (a.includes("PROJECT"))    return { icon: "🗂️",  color: "bg-blue-50 text-blue-700 border-blue-200",    label: "Project" };
    if (a.includes("TASK"))       return { icon: "✅",   color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Task" };
    if (a.includes("SUBMISSION")) return { icon: "📤",  color: "bg-amber-50 text-amber-700 border-amber-200",   label: "Submission" };
    if (a.includes("MILESTONE"))  return { icon: "🏁",  color: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Milestone" };
    if (a.includes("COMMENT"))    return { icon: "💬",  color: "bg-purple-50 text-purple-700 border-purple-200", label: "Comment" };
    if (a.includes("TEMPLATE"))   return { icon: "📋",  color: "bg-pink-50 text-pink-700 border-pink-200",       label: "Template" };
    if (a.includes("USER"))       return { icon: "👤",  color: "bg-cyan-50 text-cyan-700 border-cyan-200",       label: "User" };
    return                               { icon: "⚡",   color: "bg-slate-100 text-slate-700 border-slate-200",  label: "System" };
  }
  switch (entityType) {
    case "PROJECT":    return { icon: "🗂️",  color: "bg-blue-50 text-blue-700 border-blue-200",       label: "Project" };
    case "TASK":       return { icon: "✅",   color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Task" };
    case "SUBMISSION": return { icon: "📤",  color: "bg-amber-50 text-amber-700 border-amber-200",    label: "Submission" };
    case "MILESTONE":  return { icon: "🏁",  color: "bg-indigo-50 text-indigo-700 border-indigo-200",  label: "Milestone" };
    case "COMMENT":    return { icon: "💬",  color: "bg-purple-50 text-purple-700 border-purple-200",  label: "Comment" };
    case "TEMPLATE":   return { icon: "📋",  color: "bg-pink-50 text-pink-700 border-pink-200",        label: "Template" };
    default:           return { icon: "⚡",   color: "bg-slate-100 text-slate-700 border-slate-200",   label: "System" };
  }
}

/** Relative timestamp helper */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1)   return "just now";
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7)   return `${diffDays}d ago`;
  return formatUIDate(date);
}

const ACTION_OPTIONS = [
  "ALL",
  "PROJECT_CREATED", "PROJECT_UPDATED", "PROJECT_DELETED",
  "TASK_CREATED", "TASK_UPDATED", "TASK_STATUS_CHANGED",
  "SUBMISSION_CREATED", "SUBMISSION_APPROVED", "SUBMISSION_REVISION_REQUESTED",
  "MILESTONE_CREATED", "MILESTONE_COMPLETED",
  "COMMENT_ADDED", "TEMPLATE_CREATED",
  "USER_INVITED", "USER_LOGGED_IN",
];

const ENTITY_OPTIONS = ["ALL", "PROJECT", "TASK", "SUBMISSION", "MILESTONE", "COMMENT", "TEMPLATE"];

const PAGE_SIZE = 20;

// ── Single Timeline Row ───────────────────────────────────────────────────────
function ActivityRow({ activity }) {
  const meta = getEntityMeta(activity.entityType, activity.action);
  const line = formatActivityLine(activity);

  return (
    <div className="relative flex gap-4 group">
      {/* Circle dot on the line */}
      <div className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center shrink-0 text-base shadow-sm transition-transform group-hover:scale-110 z-10 ${meta.color.split(" ")[0]} ${meta.color.split(" ")[1]}`}>
        {meta.icon}
      </div>

      <div className="flex-1 min-w-0 pb-6 border-b border-slate-100 last:border-0">
        {/* Chips row */}
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider border ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {activity.action?.replace(/_/g, " ")}
          </span>
          <span className="ml-auto text-xs text-slate-400 font-medium shrink-0">
            {formatDate(activity.createdAt)}
          </span>
        </div>

        {/* Human-readable line */}
        <p className="m-0 text-slate-800 text-sm leading-relaxed">
          <span className="font-bold text-slate-900">{activity.userId?.name || "System"}</span>
          {" "}
          <span className="text-slate-600">
            {ACTION_LABELS[activity.action] || activity.action?.replace(/_/g, " ").toLowerCase()}
          </span>
          {activity.metadata?.title && (
            <> — <span className="font-semibold text-slate-800">"{activity.metadata.title}"</span></>
          )}
        </p>

        {activity.userId?.email && (
          <p className="m-0 mt-0.5 text-xs text-slate-400">{activity.userId.email}</p>
        )}
      </div>
    </div>
  );
}

// ── Main Admin Activity Log ───────────────────────────────────────────────────
export default function ActivityLogs() {
  const { activities, pagination, setActivities } = useActivityStore();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Filters
  const [actionFilter, setActionFilter]       = useState("ALL");
  const [entityFilter, setEntityFilter]       = useState("ALL");
  const [startDate, setStartDate]             = useState("");
  const [endDate, setEndDate]                 = useState("");
  const [page, setPage]                       = useState(1);

  // ── Fetch activities ──────────────────────────────────────────────────────
  const loadActivities = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: PAGE_SIZE };
      if (actionFilter !== "ALL") params.action     = actionFilter;
      if (entityFilter !== "ALL") params.entityType = entityFilter;
      if (startDate)              params.startDate  = startDate;
      if (endDate)                params.endDate    = endDate;

      const response = await api.get("/activities", { params });
      const { activities: acts, pagination: pg } = response.data.data;
      setActivities(acts || [], pg || null);
      setPage(p);
    } catch (err) {
      console.error("Error loading activities:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Only admins can view the activity log.");
      } else {
        setError("Failed to load activity log. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityFilter, startDate, endDate, setActivities]);

  // Initial load + on filter change
  useEffect(() => {
    loadActivities(1);
  }, [loadActivities]);

  const totalPages = pagination?.pages || 1;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          System Activity Log
        </h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">
          Full audit trail of every action across the platform — filterable by type, entity, and date range.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
        {/* Action filter */}
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-colors"
          >
            {ACTION_OPTIONS.map(a => (
              <option key={a} value={a}>{a === "ALL" ? "All Actions" : a.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {/* Entity filter */}
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entity Type</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-colors"
          >
            {ENTITY_OPTIONS.map(e => (
              <option key={e} value={e}>{e === "ALL" ? "All Entities" : e}</option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-colors"
          />
        </div>

        {/* Clear filters */}
        {(actionFilter !== "ALL" || entityFilter !== "ALL" || startDate || endDate) && (
          <button
            onClick={() => { setActionFilter("ALL"); setEntityFilter("ALL"); setStartDate(""); setEndDate(""); }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer bg-white self-end"
          >
            Clear Filters
          </button>
        )}

        {/* Pagination info */}
        {pagination && (
          <div className="ml-auto text-xs text-slate-500 font-medium self-end">
            {pagination.total} total events · Page {page} of {totalPages}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Timeline Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h2 className="m-0 text-sm font-bold text-slate-900">Activity Timeline</h2>
          {!loading && activities.length > 0 && (
            <span className="ml-1 text-xs text-slate-500">({activities.length} shown)</span>
          )}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading activity log...</div>
          ) : activities.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <div className="text-4xl mb-3">📭</div>
              No activities match the current filters.
            </div>
          ) : (
            <div className="flex flex-col">
              {activities.map((activity, idx) => (
                <ActivityRow key={activity._id || idx} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => loadActivities(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ← Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => loadActivities(p)}
                className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-colors cursor-pointer ${
                  p === page
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => loadActivities(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
