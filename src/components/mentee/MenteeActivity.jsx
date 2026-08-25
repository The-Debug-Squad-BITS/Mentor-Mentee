import { useState, useEffect } from "react";
import api from "../../lib/api";
import { formatUIDate } from "../../lib/datetime";
import {
  Folder,
  CheckCircle,
  Upload,
  Flag,
  MessageSquare,
  FileText,
  User,
  Activity as ActivityIcon,
  Inbox,
} from "../ui/Icons";

const ACTION_LABELS = {
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

// Entity → stroke icon + semantic tone. Same mapping as the admin activity log,
// so a "submission" reads identically wherever it is surfaced.
const ENTITY_META = {
  PROJECT:    { Icon: Folder,          color: "bg-brand-50 text-brand-700 border-brand-200",       label: "Project" },
  TASK:       { Icon: CheckCircle,     color: "bg-success-50 text-success-700 border-success-200", label: "Task" },
  SUBMISSION: { Icon: Upload,          color: "bg-warning-50 text-warning-700 border-warning-200", label: "Submission" },
  MILESTONE:  { Icon: Flag,            color: "bg-info-50 text-info-700 border-info-200",          label: "Milestone" },
  COMMENT:    { Icon: MessageSquare,   color: "bg-brand-50 text-brand-700 border-brand-200",       label: "Comment" },
  TEMPLATE:   { Icon: FileText,        color: "bg-slate-100 text-slate-700 border-slate-200",      label: "Template" },
  USER:       { Icon: User,            color: "bg-info-50 text-info-700 border-info-200",          label: "User" },
  SYSTEM:     { Icon: ActivityIcon,    color: "bg-slate-100 text-slate-700 border-slate-200",      label: "System" },
};

function getEntityMeta(entityType, action) {
  if (!entityType && action) {
    const a = action.toUpperCase();
    if (a.includes("PROJECT"))    return ENTITY_META.PROJECT;
    if (a.includes("TASK"))       return ENTITY_META.TASK;
    if (a.includes("SUBMISSION")) return ENTITY_META.SUBMISSION;
    if (a.includes("MILESTONE"))  return ENTITY_META.MILESTONE;
    if (a.includes("COMMENT"))    return ENTITY_META.COMMENT;
    if (a.includes("TEMPLATE"))   return ENTITY_META.TEMPLATE;
    if (a.includes("USER"))       return ENTITY_META.USER;
    return ENTITY_META.SYSTEM;
  }
  return ENTITY_META[entityType] || ENTITY_META.SYSTEM;
}

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

export default function MenteeActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get("/activities/me", { params: { limit: 20 } });
        setActivities(response.data.data.activities || []);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title m-0">Track Activities</h1>
        <p className="page-subtitle mt-1">
          Timeline of your task submissions, review notifications, and progress milestones.
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="card p-6 md:p-8">
        {loading ? (
          <div className="flex flex-col gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <span className="skeleton h-9 w-9 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <span className="skeleton h-3 w-1/3" />
                  <span className="skeleton h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Inbox size={22} />
            </span>
            <p className="empty-state-title">No activity yet</p>
            <p className="empty-state-text">
              Your submissions, reviews and milestone progress will appear here as you work.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {activities.map((act, idx) => {
              const meta = getEntityMeta(act.entityType, act.action);
              return (
                <div key={act._id || idx} className="relative flex gap-4 group">
                  {/* Circle icon dot */}
                  <div className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-xs ${meta.color}`}>
                    <meta.Icon size={16} />
                  </div>

                  <div className="flex-1 min-w-0 pb-6 border-b border-slate-100 last:border-0">
                    {/* Chips row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider border ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {act.action?.replace(/_/g, " ")}
                      </span>
                      <span className="ml-auto text-xs text-slate-400 font-medium shrink-0">
                        {formatDate(act.createdAt)}
                      </span>
                    </div>

                    {/* Description line */}
                    <p className="m-0 text-slate-800 text-sm leading-relaxed">
                      <span className="font-bold text-slate-900">{act.userId?.name || "You"}</span>
                      {" "}
                      <span className="text-slate-600">
                        {ACTION_LABELS[act.action] || act.action?.replace(/_/g, " ").toLowerCase()}
                      </span>
                      {act.metadata?.title && (
                        <> — <span className="font-semibold text-slate-800">"{act.metadata.title}"</span></>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
