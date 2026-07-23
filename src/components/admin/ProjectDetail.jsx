import { useState, useEffect, useCallback } from "react";
import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import api from "../../lib/api";
import { toast } from "react-toastify";
import MilestonesSection from "./MilestonesSection";
import CommentSection from "../ui/CommentSection";
import { formatActivityLine } from "./ActivityLogs";

// ── Helpers shared with ActivityLogs ─────────────────────────────────────────
function getProjectEntityMeta(entityType, action) {
  const k = entityType || "";
  const a = action || "";
  if (k === "PROJECT"    || a.includes("PROJECT"))    return { icon: "🗂️",  color: "bg-blue-50 text-blue-700 border-blue-200",       label: "Project" };
  if (k === "TASK"       || a.includes("TASK"))       return { icon: "✅",   color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Task" };
  if (k === "SUBMISSION" || a.includes("SUBMISSION")) return { icon: "📤",  color: "bg-amber-50 text-amber-700 border-amber-200",    label: "Submission" };
  if (k === "MILESTONE"  || a.includes("MILESTONE"))  return { icon: "🏁",  color: "bg-indigo-50 text-indigo-700 border-indigo-200",  label: "Milestone" };
  if (k === "COMMENT"    || a.includes("COMMENT"))    return { icon: "💬",  color: "bg-purple-50 text-purple-700 border-purple-200",  label: "Comment" };
  if (k === "TEMPLATE"   || a.includes("TEMPLATE"))   return { icon: "📋",  color: "bg-pink-50 text-pink-700 border-pink-200",        label: "Template" };
  return                                                      { icon: "⚡",   color: "bg-slate-100 text-slate-700 border-slate-200",   label: "System" };
}

function fmtRelative(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/** Per-project activity feed — usable by ADMIN and MENTOR */
function ProjectActivityFeed({ projectId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    api.get(`/activities/project/${projectId}`)
      .then(res => setActivities(res.data.data.activities || []))
      .catch(err => {
        console.error("Error loading project activities:", err);
        setError("Failed to load activity for this project.");
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <h3 className="m-0 text-sm font-bold text-slate-900">Project Activity</h3>
        {!loading && activities.length > 0 && (
          <span className="ml-1 text-xs text-slate-500">({activities.length} events)</span>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading activity...</div>
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            ⚠️ {error}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <div className="text-3xl mb-2">📭</div>
            No activity recorded for this project yet.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 pl-6 flex flex-col gap-0">
            {activities.map((activity, idx) => {
              const meta = getProjectEntityMeta(activity.entityType, activity.action);
              return (
                <div key={activity._id || idx} className="relative pb-5 last:pb-0 group">
                  <div className={`w-8 h-8 rounded-full border-2 border-white absolute -left-[41px] top-0 flex items-center justify-center text-sm shadow-sm transition-transform group-hover:scale-110 z-10 ${meta.color.split(" ")[0]} ${meta.color.split(" ")[1]}`}>
                    {meta.icon}
                  </div>
                  <div className="pl-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider border ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="ml-auto text-xs text-slate-400 font-medium shrink-0">
                        {fmtRelative(activity.createdAt)}
                      </span>
                    </div>
                    <p className="m-0 text-slate-700 text-sm leading-relaxed">
                      {formatActivityLine(activity)}
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



export default function ProjectDetail({ projectId, onBack, onRefresh }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab state for project detail sections
  const [activeTab, setActiveTab] = useState("Overview");

  // Inline actions states
  const [showAssignForm, setShowAssignForm] = useState(false);

  // Mentor/Mentee dropdown data
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);

  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [mentorAssignLoading, setMentorAssignLoading] = useState(false);
  const [menteeAssignLoading, setMenteeAssignLoading] = useState(false);

  // Helper to generate avatar initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  };

  // Helper to generate a consistent color from name
  const getColor = (name) => {
    const colors = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // ── Fetch project data from backend ─────────────────────────────────
  const refreshProjectData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/projects", { params: { limit: 50 } });
      const allProjects = response.data.data.projects;
      const found = allProjects.find(p => p._id === projectId);
      if (found) {
        setProject(found);
        // Pre-select current mentor if assigned
        setSelectedMentor(found.mentorId?._id || "");
        // Pre-select current mentees if assigned
        setSelectedMentees(found.mentees ? found.mentees.map(m => m._id) : []);
      } else {
        setError("Project not found.");
      }

      // Load tasks for this project
      try {
        const tasksRes = await api.get("/tasks", { params: { projectId, limit: 50 } });
        setTasks(tasksRes.data.data.tasks || []);
      } catch {
        setTasks([]);
      }
    } catch (err) {
      setError("Failed to load project details.");
      console.error("Error loading project:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // ── Load mentors and mentees for assignment dropdowns ────────────────
  const loadUsersForDropdowns = useCallback(async () => {
    try {
      const [mentorsRes, menteesRes] = await Promise.all([
        api.get("/users", { params: { role: "MENTOR", limit: 100 } }),
        api.get("/users", { params: { role: "MENTEE", limit: 100 } }),
      ]);
      setMentors(mentorsRes.data.data.users || []);
      setMentees(menteesRes.data.data.users || []);
    } catch (err) {
      console.error("Error loading users for dropdowns:", err);
    }
  }, []);

  useEffect(() => {
    refreshProjectData();
    loadUsersForDropdowns();
  }, [refreshProjectData, loadUsersForDropdowns]);

  // ── Assign Mentor ───────────────────────────────────────────────────
  const handleAssignMentor = async () => {
    if (!selectedMentor) return;
    setMentorAssignLoading(true);
    try {
      await api.patch(`/projects/${projectId}/assign-mentor`, { mentorId: selectedMentor });
      refreshProjectData();
      if (onRefresh) onRefresh();
      toast.success("Mentor assigned successfully.");
    } catch (err) {
      toast.error("Failed to assign mentor.");
      console.error("Assign mentor error:", err);
    } finally {
      setMentorAssignLoading(false);
    }
  };

  // ── Assign Mentees ──────────────────────────────────────────────────
  const handleAssignMentees = async () => {
    if (selectedMentees.length === 0) return;
    setMenteeAssignLoading(true);
    try {
      await api.patch(`/projects/${projectId}/assign-mentees`, { mentees: selectedMentees });
      refreshProjectData();
      if (onRefresh) onRefresh();
      toast.success("Mentees assigned successfully.");
    } catch (err) {
      toast.error("Failed to assign mentees.");
      console.error("Assign mentees error:", err);
    } finally {
      setMenteeAssignLoading(false);
    }
  };

  // ── Delete project ──────────────────────────────────────────────────
  const handleDeleteProject = async () => {
    const confirmed = window.confirm("Delete this project? This cannot be undone.");
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${projectId}`);
      if (onRefresh) onRefresh();
      toast.success("Project deleted successfully.");
      onBack(); // Navigate back to projects list
    } catch (err) {
      toast.error("Failed to delete project.");
      console.error("Delete project error:", err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Loading project details...</div>;
  if (error || !project) return <div className="p-8 text-center text-slate-700 font-medium">{error || "Project not found."}</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={onBack}
            className="w-10 h-10 p-0 flex items-center justify-center text-lg rounded-lg"
          >
            ←
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="m-0 mt-1 text-slate-500 text-sm">Project Overseer & Deliverables Console</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowAssignForm(!showAssignForm)}
          >
            {showAssignForm ? "Cancel" : "Assign Members"}
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteProject}
          >
            Delete Project
          </Button>
        </div>
      </div>

      {/* Assignment overlay panel */}
      {showAssignForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Assign Mentor Column */}
            <div className="flex flex-col justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Assign Mentor
                </label>
                <select
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">-- Choose Mentor --</option>
                  {mentors.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAssignMentor}
                  disabled={!selectedMentor || mentorAssignLoading}
                  className="w-full sm:w-auto"
                >
                  {mentorAssignLoading ? "Saving..." : "Save Mentor"}
                </Button>
              </div>
            </div>

            {/* Assign Mentees Column */}
            <div className="flex flex-col justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Assign Mentees ({selectedMentees.length} selected)
                </label>
                <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto flex flex-col gap-2 bg-white shadow-inner">
                  {mentees.length === 0 ? (
                    <div className="text-sm text-slate-500 italic py-2">No mentees available.</div>
                  ) : (
                    mentees.map(st => {
                      const isChecked = selectedMentees.includes(st._id);
                      return (
                        <label key={st._id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedMentees(selectedMentees.filter(id => id !== st._id));
                              } else {
                                setSelectedMentees([...selectedMentees, st._id]);
                              }
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-sm font-medium text-slate-800">{st.name}</span>
                          <span className="text-xs text-slate-500 ml-auto">{st.email}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAssignMentees}
                  disabled={selectedMentees.length === 0 || menteeAssignLoading}
                  className="mt-4 w-full sm:w-auto"
                >
                  {menteeAssignLoading ? "Saving..." : "Save Mentees"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {["Overview", "Milestones", "Comments", "Activity"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border-0 cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "Milestones" ? (
        <MilestonesSection projectId={projectId} />
      ) : activeTab === "Comments" ? (
        <CommentSection entityType="PROJECT" entityId={projectId} />
      ) : activeTab === "Activity" ? (
        <ProjectActivityFeed projectId={projectId} />
      ) : (
      /* Main Grid — Overview tab */
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Description & Dates */}
          <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h2 className="m-0 mb-4 text-base font-bold text-slate-900">Project Description</h2>
            <p className="m-0 mb-6 text-slate-700 text-sm leading-relaxed">
              {project.description || "No description provided for this project."}
            </p>
            <div className="flex gap-8 text-sm text-slate-700">
              <div>
                <span className="block text-xs text-slate-500 font-semibold uppercase mb-1">Start Date</span>
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}
              </div>
              <div>
                <span className="block text-xs text-slate-500 font-semibold uppercase mb-1">End Date</span>
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}
              </div>
            </div>
          </div>

          {/* Members assigned */}
          <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h2 className="m-0 mb-5 text-base font-bold text-slate-900">Project Team Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mentor */}
              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Assigned Mentor</span>
                {project.mentorId ? (
                  <div className="flex items-center gap-3">
                    <Avatar initials={getInitials(project.mentorId.name)} color={getColor(project.mentorId.name)} size={40} />
                    <div className="min-w-0">
                      <span className="block font-semibold text-slate-900 text-sm truncate">{project.mentorId.name}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">{project.mentorId.email || ""}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic py-2">No mentor assigned yet.</div>
                )}
              </div>

              {/* Mentees */}
              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Assigned Mentees ({project.mentees?.length || 0})</span>
                {project.mentees && project.mentees.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {project.mentees.map(m => (
                      <div key={m._id} className="flex items-center gap-3">
                        <Avatar initials={getInitials(m.name)} color={getColor(m.name)} size={28} />
                        <div className="min-w-0">
                          <span className="block font-medium text-slate-800 text-sm truncate">{m.name}</span>
                          <span className="block text-xs text-slate-500 mt-0.5">{m.email || ""}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic py-2">No mentees assigned yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Task Summary Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="m-0 text-base font-bold text-slate-900">Task Summary ({tasks.length})</h2>
            </div>
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No tasks assigned under this project yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-white border-b border-slate-200">
                      {["Task Title", "Assignee", "Priority", "Status"].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map(t => (
                      <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{t.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{t.assignedTo?.name || "Unassigned"}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">{t.priority}</td>
                        <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column — Project Info */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col gap-6 shadow-sm">
          <h2 className="m-0 text-base font-bold text-slate-900">Project Info</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Status</span>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Mentor</span>
              <span className="font-medium text-slate-900">{project.mentorId?.name || "None"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Mentees</span>
              <span className="font-medium text-slate-900">{project.mentees?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Tasks</span>
              <span className="font-medium text-slate-900">{tasks.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Start</span>
              <span className="font-medium text-slate-900">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">End</span>
              <span className="font-medium text-slate-900">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
