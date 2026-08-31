import { useState, useEffect, useCallback } from "react";
import {
  Close, AlertTriangle, AlertCircle, Inbox,
  Folder, CheckCircle, Upload, Flag, MessageSquare, FileText,
  Activity as ActivityIcon, Clock,
} from "../ui/Icons";
import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import MultiSelect from "../ui/MultiSelect";
import api from "../../lib/api";
import { toast } from "react-toastify";
import MilestonesSection from "./MilestonesSection";
import CommentSection from "../ui/CommentSection";
import { formatActivityLine } from "./ActivityLogs";
import { formatUIDate } from "../../lib/datetime";

// ── Helpers shared with ActivityLogs ─────────────────────────────────────────
function getProjectEntityMeta(entityType, action) {
  const k = entityType || "";
  const a = action || "";
  if (k === "PROJECT"    || a.includes("PROJECT"))    return { icon: Folder,        color: "bg-info-50 text-info-700 border-info-200",          label: "Project" };
  if (k === "TASK"       || a.includes("TASK"))       return { icon: CheckCircle,   color: "bg-success-50 text-success-700 border-success-200", label: "Task" };
  if (k === "SUBMISSION" || a.includes("SUBMISSION")) return { icon: Upload,        color: "bg-warning-50 text-warning-700 border-warning-200", label: "Submission" };
  if (k === "MILESTONE"  || a.includes("MILESTONE"))  return { icon: Flag,          color: "bg-brand-50 text-brand-700 border-brand-200",       label: "Milestone" };
  if (k === "COMMENT"    || a.includes("COMMENT"))    return { icon: MessageSquare, color: "bg-violet-50 text-violet-700 border-violet-200",    label: "Comment" };
  if (k === "TEMPLATE"   || a.includes("TEMPLATE"))   return { icon: FileText,      color: "bg-pink-50 text-pink-700 border-pink-200",          label: "Template" };
  return                                                      { icon: ActivityIcon, color: "bg-slate-50 text-slate-700 border-slate-200",       label: "System" };
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
  return formatUIDate(new Date(dateStr));
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
    <div className="card overflow-hidden">
      <div className="card-header">
        <h3 className="section-title m-0 flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          Project Activity
          {!loading && activities.length > 0 && (
            <span className="badge badge-neutral">{activities.length} events</span>
          )}
        </h3>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="ml-4 flex flex-col gap-6 border-l-2 border-slate-100 pl-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative">
                <span className="skeleton absolute -left-[41px] top-0 h-8 w-8 rounded-full" />
                <span className="skeleton mb-2 block h-4 w-32" />
                <span className="skeleton block h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="notice notice-danger">
            <AlertTriangle size={16} className="mt-px shrink-0" />
            <span>{error}</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Inbox size={22} />
            </span>
            <p className="empty-state-title">No activity yet</p>
            <p className="empty-state-text">
              Task, submission and review events on this project will appear here as they happen.
            </p>
          </div>
        ) : (
          <div className="relative ml-4 flex flex-col gap-0 border-l-2 border-slate-100 pl-6">
            {activities.map((activity, idx) => {
              const meta = getProjectEntityMeta(activity.entityType, activity.action);
              const Glyph = meta.icon;
              return (
                <div key={activity._id || idx} className="group relative pb-5 last:pb-0">
                  <div
                    className={`absolute -left-[41px] top-0 z-10 flex h-8 w-8 items-center justify-center
                      rounded-full border-2 border-white shadow-xs ${meta.color.split(" ")[0]} ${meta.color.split(" ")[1]}`}
                  >
                    <Glyph size={15} />
                  </div>
                  <div className="pl-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className={`badge ${meta.color}`}>{meta.label}</span>
                      <span className="ml-auto shrink-0 text-[12px] font-medium text-slate-500">
                        {fmtRelative(activity.createdAt)}
                      </span>
                    </div>
                    <p className="m-0 text-[13.5px] leading-relaxed text-slate-700">
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
  const [statusLoading, setStatusLoading] = useState(false);

  /* The two pickers used to fail silently: if /users could not be read the
     lists were simply empty, which is indistinguishable from a department that
     has no supervisors or students in it. */
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState(null);

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
    setPeopleLoading(true);
    setPeopleError(null);
    try {
      const [mentorsRes, menteesRes] = await Promise.all([
        api.get("/users", { params: { role: "MENTOR", limit: 100 } }),
        api.get("/users", { params: { role: "MENTEE", limit: 100 } }),
      ]);
      setMentors(mentorsRes.data.data.users || []);
      setMentees(menteesRes.data.data.users || []);
    } catch (err) {
      console.error("Error loading users for dropdowns:", err);
      setPeopleError(
        err.response?.data?.message || "Could not load the member list."
      );
    } finally {
      setPeopleLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjectData();
    loadUsersForDropdowns();
  }, [refreshProjectData, loadUsersForDropdowns]);

  /* The server's message is far more useful than "Failed to …" — it names the
     account that was rejected, or says the project is gone. Only fall back to
     a generic line when there is nothing to report. */
  const describeError = (err, fallback) =>
    err.response?.data?.message ||
    (err.code === "ECONNABORTED" || !err.response
      ? "The server did not respond. Check your connection and try again."
      : fallback);

  /* Choosing "-- Choose Mentor --" is how a coordinator takes a supervisor off
     a project. The endpoint accepts a null mentorId for exactly that, but the
     button used to be disabled whenever nothing was selected, so the only
     reachable operation was assigning someone new. */
  const assignedMentorId = project?.mentorId?._id || "";
  const mentorSelectionChanged = selectedMentor !== assignedMentorId;

  // ── Assign Mentor ───────────────────────────────────────────────────
  const handleAssignMentor = async () => {
    if (!mentorSelectionChanged) return;
    const removing = !selectedMentor;
    setMentorAssignLoading(true);
    try {
      await api.patch(`/projects/${projectId}/assign-mentor`, {
        mentorId: selectedMentor || null,
      });
      await refreshProjectData();
      if (onRefresh) onRefresh();
      toast.success(
        removing ? "Mentor removed from this project." : "Mentor assigned successfully."
      );
    } catch (err) {
      toast.error(describeError(err, "Failed to assign mentor."));
      console.error("Assign mentor error:", err);
    } finally {
      setMentorAssignLoading(false);
    }
  };

  /* Saving an empty selection is how a coordinator removes the last student
     from a project, so it is a legitimate action rather than a no-op — the
     button used to be disabled in exactly that case, leaving no way to do it. */
  const assignedMenteeIds = (project?.mentees || []).map((m) => m._id);
  const menteeSelectionChanged =
    assignedMenteeIds.length !== selectedMentees.length ||
    assignedMenteeIds.some((id) => !selectedMentees.includes(id));

  // ── Assign Mentees ──────────────────────────────────────────────────
  const handleAssignMentees = async () => {
    if (!menteeSelectionChanged) return;
    const removingAll = selectedMentees.length === 0 && assignedMenteeIds.length > 0;
    setMenteeAssignLoading(true);
    try {
      await api.patch(`/projects/${projectId}/assign-mentees`, { mentees: selectedMentees });
      await refreshProjectData();
      if (onRefresh) onRefresh();
      toast.success(
        removingAll
          ? "All mentees removed from this project."
          : "Mentees assigned successfully."
      );
    } catch (err) {
      toast.error(describeError(err, "Failed to assign mentees."));
      console.error("Assign mentees error:", err);
    } finally {
      setMenteeAssignLoading(false);
    }
  };

  // ── Change project status ───────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await api.patch(`/projects/${projectId}`, { status: newStatus });
      refreshProjectData();
      if (onRefresh) onRefresh();
      toast.success(`Project status updated to ${newStatus.toLowerCase()}.`);
    } catch (err) {
      toast.error("Failed to update project status.");
      console.error("Status update error:", err);
    } finally {
      setStatusLoading(false);
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

  if (loading) return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <span className="skeleton h-8 w-64" />
      <span className="skeleton h-4 w-96 max-w-full" />
      <div className="card flex flex-col gap-3 p-5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="skeleton h-11 w-full" />
        ))}
      </div>
    </div>
  );
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
              <h1 className="page-title m-0">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="page-subtitle mt-1">Project Overseer & Deliverables Console</p>
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
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Assign Mentor Column */}
            <div className="flex flex-col justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div>
                <label
                  htmlFor="assign-mentor-select"
                  className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide"
                >
                  Assign Mentor
                </label>
                <select
                  id="assign-mentor-select"
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  disabled={peopleLoading || mentorAssignLoading}
                  className="select-field"
                >
                  <option value="">
                    {peopleLoading ? "Loading mentors…" : "-- Choose Mentor --"}
                  </option>
                  {mentors.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
                {!peopleLoading && peopleError && (
                  <p className="field-error">
                    {peopleError}{" "}
                    <button
                      type="button"
                      onClick={loadUsersForDropdowns}
                      className="underline font-semibold bg-transparent border-0 p-0 cursor-pointer text-danger-700"
                    >
                      Retry
                    </button>
                  </p>
                )}
                {!peopleLoading && !peopleError && mentors.length === 0 && (
                  <p className="field-hint">No mentors in this organisation yet.</p>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAssignMentor}
                  disabled={!mentorSelectionChanged || mentorAssignLoading || peopleLoading}
                  className="w-full sm:w-auto"
                >
                  {mentorAssignLoading
                    ? "Saving..."
                    : !selectedMentor && assignedMentorId
                      ? "Remove Mentor"
                      : "Save Mentor"}
                </Button>
              </div>
            </div>

            {/* Assign Mentees Column */}
            <div className="flex flex-col justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div>
                <label
                  htmlFor="assign-mentees-select"
                  className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide"
                >
                  Assign Mentees ({selectedMentees.length} selected)
                </label>
                <MultiSelect
                  id="assign-mentees-select"
                  options={mentees}
                  value={selectedMentees}
                  onChange={setSelectedMentees}
                  placeholder="-- Choose Mentees --"
                  noun="mentee"
                  loading={peopleLoading}
                  error={peopleError}
                  onRetry={loadUsersForDropdowns}
                  emptyMessage="No mentees in this organisation yet."
                  disabled={menteeAssignLoading}
                />
              </div>
              <div className="mt-4 flex flex-col items-end gap-1.5">
                <Button
                  onClick={handleAssignMentees}
                  disabled={!menteeSelectionChanged || menteeAssignLoading || peopleLoading}
                  className="w-full sm:w-auto"
                >
                  {menteeAssignLoading ? "Saving..." : "Save Mentees"}
                </Button>
                {!menteeAssignLoading && !menteeSelectionChanged && (
                  <span className="text-[12px] text-slate-500">
                    {selectedMentees.length === 0
                      ? "No mentees assigned."
                      : "Already saved."}
                  </span>
                )}
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
                {project.startDate ? formatUIDate(new Date(project.startDate)) : "Not set"}
              </div>
              <div>
                <span className="block text-xs text-slate-500 font-semibold uppercase mb-1">End Date</span>
                {project.endDate ? formatUIDate(new Date(project.endDate)) : "Not set"}
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
          <div className="card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="m-0 text-base font-bold text-slate-900">Task Summary ({tasks.length})</h2>
            </div>
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No tasks assigned under this project yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table min-w-[500px]">
                  <thead>
                    <tr className="bg-white border-b border-slate-200">
                      {["Task Title", "Assignee", "Priority", "Status"].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                        <td className="font-semibold text-slate-900">{t.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{t.assignedTo?.name || "Unassigned"}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">{t.priority}</td>
                        <td><StatusBadge status={t.status} /></td>
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
            <div className="flex justify-between items-center text-sm gap-4">
              <span className="font-semibold text-slate-500">Status</span>
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusLoading}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 cursor-pointer transition-colors shadow-sm"
              >
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
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
              <span className="font-medium text-slate-900">{project.startDate ? formatUIDate(new Date(project.startDate)) : "—"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">End</span>
              <span className="font-medium text-slate-900">{project.endDate ? formatUIDate(new Date(project.endDate)) : "—"}</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
