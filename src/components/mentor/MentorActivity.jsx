import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { ACTION_LABELS } from "../admin/ActivityLogs";

// ── Entity-type → icon / color chip (reuses same logic) ──────────────────────
function getEntityMeta(entityType, action) {
  const key = entityType || "";
  const act = action || "";
  if (key === "PROJECT"    || act.includes("PROJECT"))    return { icon: "🗂️",  color: "bg-blue-50 text-blue-700 border-blue-200",       label: "Project" };
  if (key === "TASK"       || act.includes("TASK"))       return { icon: "✅",   color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Task" };
  if (key === "SUBMISSION" || act.includes("SUBMISSION")) return { icon: "📤",  color: "bg-amber-50 text-amber-700 border-amber-200",    label: "Submission" };
  if (key === "MILESTONE"  || act.includes("MILESTONE"))  return { icon: "🏁",  color: "bg-indigo-50 text-indigo-700 border-indigo-200",  label: "Milestone" };
  if (key === "COMMENT"    || act.includes("COMMENT"))    return { icon: "💬",  color: "bg-purple-50 text-purple-700 border-purple-200",  label: "Comment" };
  if (key === "TEMPLATE"   || act.includes("TEMPLATE"))   return { icon: "📋",  color: "bg-pink-50 text-pink-700 border-pink-200",        label: "Template" };
  if (act.includes("USER"))                               return { icon: "👤",  color: "bg-cyan-50 text-cyan-700 border-cyan-200",        label: "User" };
  return                                                         { icon: "⚡",   color: "bg-slate-100 text-slate-700 border-slate-200",   label: "System" };
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
  return date.toLocaleDateString();
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
    <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">

      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Project Activity
        </h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">
          A combined timeline across the projects assigned to you — tasks, submissions, comments, and milestones.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 shadow-sm">
          ℹ️ {error}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h2 className="m-0 text-sm font-bold text-slate-900">Activity Timeline</h2>
          {!loading && activities.length > 0 && (
            <span className="ml-1 text-xs text-slate-500">({activities.length} events)</span>
          )}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Loading activity...
            </div>
          ) : !error && activities.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <div className="text-4xl mb-3">📭</div>
              {hasProjects
                ? "No activity recorded on your projects yet. It will appear here as your mentees work on tasks and submissions."
                : "No projects are assigned to you yet. Once an admin assigns you a project, its activity will show up here."}
            </div>
          ) : !error && (
            <div className="relative border-l-2 border-slate-100 ml-4 pl-6 flex flex-col gap-0">
              {activities.map((activity, idx) => {
                const meta = getEntityMeta(activity.entityType, activity.action);
                return (
                  <div key={activity._id || idx} className="relative pb-6 last:pb-0 group">
                    {/* Dot on the timeline line */}
                    <div className={`w-8 h-8 rounded-full border-2 border-white absolute -left-[41px] top-0 flex items-center justify-center text-sm shadow-sm transition-transform group-hover:scale-110 z-10 ${meta.color.split(" ")[0]} ${meta.color.split(" ")[1]}`}>
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div className="pl-2">
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

                      <p className="m-0 text-slate-700 text-sm leading-relaxed">
                        <span className="font-semibold text-slate-900">
                          {activity.userId?.name || "Someone"}
                        </span>
                        {" "}
                        <span className="text-slate-600">
                          {ACTION_LABELS[activity.action] || activity.action?.replace(/_/g, " ").toLowerCase()}
                        </span>
                        {activity.metadata?.title && (
                          <> — <span className="font-semibold text-slate-800">"{activity.metadata.title}"</span></>
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
