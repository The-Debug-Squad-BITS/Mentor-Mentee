import { useState, useEffect } from "react";
import api from "../../lib/api";

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
  return date.toLocaleDateString();
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
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Track Activities</h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">Timeline of your task submissions, review notifications, and progress milestones.</p>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading activity feed...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">
            No activities logged yet. Get started by completing your assigned tasks!
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {activities.map((act, idx) => {
              const meta = getEntityMeta(act.entityType, act.action);
              return (
                <div key={act._id || idx} className="relative flex gap-4 group">
                  {/* Circle icon dot */}
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
