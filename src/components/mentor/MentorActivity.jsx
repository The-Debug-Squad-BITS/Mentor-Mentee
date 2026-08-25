import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { ACTION_LABELS } from "../admin/ActivityLogs";
import {
  Folder,
  CheckCircle,
  Upload,
  Flag,
  MessageSquare,
  FileText,
  User,
  Activity as ActivityIcon,
  Clock,
  Inbox,
  Info,
} from "../ui/Icons";
import { formatUIDate } from "../../lib/datetime";

// ── Entity-type → icon / color chip (reuses same logic) ──────────────────────
function getEntityMeta(entityType, action) {
  const key = entityType || "";
  const act = action || "";
  if (key === "PROJECT"    || act.includes("PROJECT"))    return { icon: Folder,        color: "bg-info-50 text-info-700 border-info-200",          label: "Project" };
  if (key === "TASK"       || act.includes("TASK"))       return { icon: CheckCircle,   color: "bg-success-50 text-success-700 border-success-200", label: "Task" };
  if (key === "SUBMISSION" || act.includes("SUBMISSION")) return { icon: Upload,        color: "bg-warning-50 text-warning-700 border-warning-200", label: "Submission" };
  if (key === "MILESTONE"  || act.includes("MILESTONE"))  return { icon: Flag,          color: "bg-brand-50 text-brand-700 border-brand-200",       label: "Milestone" };
  if (key === "COMMENT"    || act.includes("COMMENT"))    return { icon: MessageSquare, color: "bg-violet-50 text-violet-700 border-violet-200",    label: "Comment" };
  if (key === "TEMPLATE"   || act.includes("TEMPLATE"))   return { icon: FileText,      color: "bg-pink-50 text-pink-700 border-pink-200",          label: "Template" };
  if (act.includes("USER"))                               return { icon: User,          color: "bg-cyan-50 text-cyan-700 border-cyan-200",          label: "User" };
  return                                                         { icon: ActivityIcon,  color: "bg-slate-50 text-slate-700 border-slate-200",       label: "System" };
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMins  = Math.floor((now - date) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);
  if (diffMins < 1)   return "just now";
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7)   return `${diffDays}d ago`;
  return formatUIDate(date);
}

export default function MentorActivity() {
  const { user } = useAuthStore();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [hasProjects, setHasProjects] = useState(true);

  // ── Load activity across the mentor's assigned projects ────────────────────
  //
  // Mentors are NOT authorized for the admin-only /activities/user/:id endpoint,
  // but they ARE authorized for /activities/project/:projectId on projects they
  // are assigned to. So we fetch the mentor's projects, then aggregate each
  // project's timeline into one combined, chronologically-sorted feed.
  const loadActivity = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const projectsRes = await api.get("/projects", { params: { limit: 50 } });
      const projects = projectsRes.data.data.projects || [];
      setHasProjects(projects.length > 0);

      if (projects.length === 0) {
        setActivities([]);
        return;
      }

      // Fetch every assigned project's timeline in parallel; ignore any that fail.
      const timelines = await Promise.all(
        projects.map((p) =>
          api
            .get(`/activities/project/${p._id}`, { params: { limit: 50 } })
            .then((res) => res.data.data.activities || [])
            .catch(() => [])
        )
      );

      // Merge, de-duplicate by _id (an entity can belong to more than one query),
      // and sort newest-first.
      const merged = [];
      const seen = new Set();
      for (const list of timelines) {
        for (const act of list) {
          const id = act._id || `${act.action}-${act.createdAt}-${act.entityId}`;
          if (seen.has(id)) continue;
          seen.add(id);
          merged.push(act);
        }
      }
      merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivities(merged);
    } catch (err) {
      console.error("Error loading activity:", err);
      setError("Failed to load activity. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="page-title m-0">Project Activity</h1>
        <p className="page-subtitle mt-1">
          A combined timeline across the projects assigned to you — tasks, submissions, comments, and milestones.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="notice notice-warning">
          <Info size={16} className="mt-px shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Timeline */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="section-title m-0 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            Activity Timeline
            {!loading && activities.length > 0 && (
              <span className="badge badge-neutral">{activities.length} events</span>
            )}
          </h2>
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="ml-4 flex flex-col gap-6 border-l-2 border-slate-100 pl-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="relative">
                  <span className="skeleton absolute -left-[41px] top-0 h-8 w-8 rounded-full" />
                  <span className="skeleton mb-2 block h-4 w-40" />
                  <span className="skeleton block h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : !error && activities.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">
                <Inbox size={22} />
              </span>
              <p className="empty-state-title">No activity yet</p>
              <p className="empty-state-text">
                {hasProjects
                  ? "Nothing has been recorded on your projects yet. Activity will appear here as your mentees work on tasks and submissions."
                  : "No projects are assigned to you yet. Once an admin assigns you a project, its activity will show up here."}
              </p>
            </div>
          ) : !error && (
            <div className="relative ml-4 flex flex-col gap-0 border-l-2 border-slate-100 pl-6">
              {activities.map((activity, idx) => {
                const meta = getEntityMeta(activity.entityType, activity.action);
                const Glyph = meta.icon;
                return (
                  <div key={activity._id || idx} className="group relative pb-6 last:pb-0">
                    {/* Dot on the timeline line */}
                    <div
                      className={`absolute -left-[41px] top-0 z-10 flex h-8 w-8 items-center justify-center
                        rounded-full border-2 border-white shadow-xs ${meta.color.split(" ")[0]} ${meta.color.split(" ")[1]}`}
                    >
                      <Glyph size={15} />
                    </div>

                    {/* Content */}
                    <div className="pl-2">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className={`badge ${meta.color}`}>{meta.label}</span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                          {activity.action?.replace(/_/g, " ")}
                        </span>
                        <span className="ml-auto shrink-0 text-[12px] font-medium text-slate-500">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>

                      <p className="m-0 text-[13.5px] leading-relaxed text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {activity.userId?.name || "Someone"}
                        </span>
                        {" "}
                        <span className="text-slate-600">
                          {ACTION_LABELS[activity.action] || activity.action?.replace(/_/g, " ").toLowerCase()}
                        </span>
                        {activity.metadata?.title && (
                          <> — <span className="font-semibold text-slate-800">&ldquo;{activity.metadata.title}&rdquo;</span></>
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
    </div>
  );
}
