import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useActivityStore } from "../../store/activityStore";
import Button from "../ui/Button";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  Folder,
  Inbox,
  MessageSquare,
  Upload,
  User,
} from "../ui/Icons";
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
    if (a.includes("PROJECT"))    return { icon: Folder,        color: "bg-info-50 text-info-700 border-info-200",       label: "Project" };
    if (a.includes("TASK"))       return { icon: CheckCircle,   color: "bg-success-50 text-success-700 border-success-200", label: "Task" };
    if (a.includes("SUBMISSION")) return { icon: Upload,        color: "bg-warning-50 text-warning-700 border-warning-200", label: "Submission" };
    if (a.includes("MILESTONE"))  return { icon: Flag,          color: "bg-brand-50 text-brand-700 border-brand-200",     label: "Milestone" };
    if (a.includes("COMMENT"))    return { icon: MessageSquare, color: "bg-slate-50 text-slate-700 border-slate-200",     label: "Comment" };
    if (a.includes("TEMPLATE"))   return { icon: FileText,      color: "bg-slate-50 text-slate-700 border-slate-200",     label: "Template" };
    if (a.includes("USER"))       return { icon: User,          color: "bg-info-50 text-info-700 border-info-200",        label: "User" };
    return                               { icon: Activity,      color: "bg-slate-100 text-slate-700 border-slate-200",    label: "System" };
  }
  switch (entityType) {
    case "PROJECT":    return { icon: Folder,        color: "bg-info-50 text-info-700 border-info-200",          label: "Project" };
    case "TASK":       return { icon: CheckCircle,   color: "bg-success-50 text-success-700 border-success-200", label: "Task" };
    case "SUBMISSION": return { icon: Upload,        color: "bg-warning-50 text-warning-700 border-warning-200", label: "Submission" };
    case "MILESTONE":  return { icon: Flag,          color: "bg-brand-50 text-brand-700 border-brand-200",       label: "Milestone" };
    case "COMMENT":    return { icon: MessageSquare, color: "bg-slate-50 text-slate-700 border-slate-200",       label: "Comment" };
    case "TEMPLATE":   return { icon: FileText,      color: "bg-slate-50 text-slate-700 border-slate-200",       label: "Template" };
    default:           return { icon: Activity,      color: "bg-slate-100 text-slate-700 border-slate-200",      label: "System" };
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
function ActivityRow({ activity, isLast }) {
  const meta = getEntityMeta(activity.entityType, activity.action);
  const line = formatActivityLine(activity);
  const EntityIcon = meta.icon;

  return (
    <div className="relative flex gap-4">
      {/* Connecting rail */}
      {!isLast && (
        <span className="absolute left-[17px] top-10 bottom-0 w-px bg-slate-200" aria-hidden="true" />
      )}

      {/* Icon marker on the rail */}
      <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 z-10 ${meta.color}`}>
        <EntityIcon size={16} />
      </div>

      <div className={`flex-1 min-w-0 ${isLast ? "pb-1" : "pb-6"}`}>
        {/* Chips row */}
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className={`badge ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">
            {activity.action?.replace(/_/g, " ")}
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <Clock size={13} />
            {formatDate(activity.createdAt)}
          </span>
        </div>

        {/* Human-readable line */}
        <p className="m-0 text-slate-700 text-sm leading-relaxed">
          <span className="font-semibold text-slate-900">{activity.userId?.name || "System"}</span>
          {" "}
          <span className="text-slate-600">
            {ACTION_LABELS[activity.action] || activity.action?.replace(/_/g, " ").toLowerCase()}
          </span>
          {activity.metadata?.title && (
            <> — <span className="font-semibold text-slate-900">"{activity.metadata.title}"</span></>
          )}
        </p>

        {activity.userId?.email && (
          <p className="m-0 mt-1 text-xs text-slate-500">{activity.userId.email}</p>
        )}
      </div>
    </div>
  );
}

/** Placeholder rows shown while the feed is loading. */
function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton w-9 h-9 rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="skeleton h-4 w-40 mb-2.5" />
            <div className="skeleton h-3.5 w-full max-w-md" />
          </div>
        </div>
      ))}
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
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Page header */}
      <div>
        <h1 className="page-title">Activity log</h1>
        <p className="page-subtitle mt-1">
          An audit trail of every recorded action across the platform. Filter by action, entity or date range.
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="p-4 flex flex-wrap items-end gap-3">
          {/* Action filter */}
          <div className="flex flex-col min-w-45 flex-1 sm:flex-none">
            <label className="field-label">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="select-field"
            >
              {ACTION_OPTIONS.map(a => (
                <option key={a} value={a}>{a === "ALL" ? "All actions" : a.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          {/* Entity filter */}
          <div className="flex flex-col min-w-40 flex-1 sm:flex-none">
            <label className="field-label">Entity type</label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="select-field"
            >
              {ENTITY_OPTIONS.map(e => (
                <option key={e} value={e}>{e === "ALL" ? "All entities" : e}</option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex flex-col">
            <label className="field-label">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex flex-col">
            <label className="field-label">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Clear filters */}
          {(actionFilter !== "ALL" || entityFilter !== "ALL" || startDate || endDate) && (
            <Button
              variant="ghost"
              onClick={() => { setActionFilter("ALL"); setEntityFilter("ALL"); setStartDate(""); setEndDate(""); }}
            >
              Clear filters
            </Button>
          )}

          {/* Pagination info */}
          {pagination && (
            <div className="ml-auto text-[13px] text-slate-500 tabular-nums pb-2.5">
              {pagination.total} events · page {page} of {totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="notice notice-danger">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Timeline Feed */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span className="text-slate-500"><Clock size={16} /></span>
            <h2 className="section-title">Timeline</h2>
            {!loading && activities.length > 0 && (
              <span className="text-[13px] text-slate-500">{activities.length} shown</span>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <TimelineSkeleton />
          ) : activities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Inbox size={22} />
              </div>
              <h3 className="empty-state-title">No activity found</h3>
              <p className="empty-state-text">
                Nothing matches the current filters. Widen the date range or clear the filters to see more events.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {activities.map((activity, idx) => (
                <ActivityRow
                  key={activity._id || idx}
                  activity={activity}
                  isLast={idx === activities.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadActivities(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft size={15} />
            Previous
          </Button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => loadActivities(p)}
                aria-label={`Go to page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={`w-9 h-9 rounded-lg border text-[13px] font-semibold tabular-nums transition-colors ${
                  p === page
                    ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                }`}
              >
                {p}
              </button>
            );
          })}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadActivities(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight size={15} />
          </Button>
        </div>
      )}
    </div>
  );
}
