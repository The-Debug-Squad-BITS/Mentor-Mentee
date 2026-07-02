import { useState, useEffect, useCallback } from "react";
import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";
import api from "../../lib/api";
import { toast } from "react-toastify";

export default function ProjectDetail({ projectId, onBack, onRefresh }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inline actions states
  const [showAssignForm, setShowAssignForm] = useState(false);

  // Mentor/Mentee dropdown data
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);

  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

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
    setAssignLoading(true);
    try {
      await api.patch(`/projects/${projectId}/assign-mentor`, { mentorId: selectedMentor });
      refreshProjectData();
      if (onRefresh) onRefresh();
      toast.success("Mentor assigned successfully.");
    } catch (err) {
      toast.error("Failed to assign mentor.");
      console.error("Assign mentor error:", err);
    } finally {
      setAssignLoading(false);
    }
  };

  // ── Assign Mentees ──────────────────────────────────────────────────
  const handleAssignMentees = async () => {
    if (selectedMentees.length === 0) return;
    setAssignLoading(true);
    try {
      await api.patch(`/projects/${projectId}/assign-mentees`, { mentees: selectedMentees });
      refreshProjectData();
      if (onRefresh) onRefresh();
      toast.success("Mentees assigned successfully.");
    } catch (err) {
      toast.error("Failed to assign mentees.");
      console.error("Assign mentees error:", err);
    } finally {
      setAssignLoading(false);
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

  if (loading) return <div className="p-8 text-center text-slate-400 font-semibold text-xs">Loading project details...</div>;
  if (error || !project) return <div className="p-8 text-center text-slate-500 font-bold">{error || "Project not found."}</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
          >
            ←
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Project Overseer & Deliverables Console</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="bg-transparent border border-slate-200 hover:border-slate-300 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            style={{ fontFamily: "inherit" }}
          >
            {showAssignForm ? "Cancel" : "Assign Members"}
          </button>
          <button
            onClick={handleDeleteProject}
            className="bg-transparent border border-red-200 hover:border-red-400 text-red-500 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            style={{ fontFamily: "inherit" }}
          >
            Delete Project
          </button>
        </div>
      </div>

      {/* Assignment overlay panel */}
      {showAssignForm && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex flex-col gap-5">
          {/* Assign Mentor */}
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Assign Mentor</label>
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-blue-400"
                style={{ fontFamily: "inherit" }}
              >
                <option value="">-- Choose Mentor --</option>
                {mentors.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAssignMentor}
              disabled={!selectedMentor || assignLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs border-0 cursor-pointer transition-colors disabled:opacity-50"
              style={{ fontFamily: "inherit" }}
            >
              {assignLoading ? "Saving..." : "Save Mentor"}
            </button>
          </div>

          <hr className="border-0 border-t border-blue-100 m-0" />

          {/* Assign Mentees (multi-select with checkboxes) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Assign Mentees ({selectedMentees.length} selected)
            </label>
            <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto flex flex-col gap-2 bg-white">
              {mentees.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2">No mentees available.</div>
              ) : (
                mentees.map(st => {
                  const isChecked = selectedMentees.includes(st._id);
                  return (
                    <label key={st._id} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
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
                        className="rounded text-blue-500 focus:ring-blue-400"
                      />
                      <span className="text-xs font-bold text-slate-700">{st.name}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{st.email}</span>
                    </label>
                  );
                })
              )}
            </div>
            <button
              onClick={handleAssignMentees}
              disabled={selectedMentees.length === 0 || assignLoading}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs border-0 cursor-pointer transition-colors disabled:opacity-50"
              style={{ fontFamily: "inherit" }}
            >
              {assignLoading ? "Saving..." : "Save Mentees"}
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Description & Dates */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
            <h2 className="m-0 mb-4 text-sm md:text-base font-extrabold text-slate-800">Project Description</h2>
            <p className="m-0 mb-6 text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
              {project.description || "No description provided for this project."}
            </p>
            <div className="flex gap-6 text-xs text-slate-500 font-semibold">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Start Date</span>
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">End Date</span>
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}
              </div>
            </div>
          </div>

          {/* Members assigned */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
            <h2 className="m-0 mb-5 text-sm md:text-base font-extrabold text-slate-800">Project Team Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mentor */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Assigned Mentor</span>
                {project.mentorId ? (
                  <div className="flex items-center gap-3">
                    <Avatar initials={getInitials(project.mentorId.name)} color={getColor(project.mentorId.name)} size={36} />
                    <div className="min-w-0">
                      <span className="block font-bold text-slate-800 text-xs md:text-sm truncate">{project.mentorId.name}</span>
                      <span className="block text-[11px] text-slate-400 font-semibold">{project.mentorId.email || ""}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic py-2 font-medium">No mentor assigned yet.</div>
                )}
              </div>

              {/* Mentees */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Assigned Mentees ({project.mentees?.length || 0})</span>
                {project.mentees && project.mentees.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {project.mentees.map(m => (
                      <div key={m._id} className="flex items-center gap-2">
                        <Avatar initials={getInitials(m.name)} color={getColor(m.name)} size={24} />
                        <span className="font-bold text-slate-700 text-xs truncate">{m.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic py-2 font-medium">No mentees assigned yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Task Summary Table */}
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
              <h2 className="m-0 text-sm md:text-base font-extrabold text-slate-800">Task Summary ({tasks.length})</h2>
            </div>
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">No tasks assigned under this project yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-100">
                  <thead>
                    <tr className="bg-slate-50">
                      {["Task Title", "Assignee", "Priority", "Status"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-800 text-xs md:text-sm">{t.title}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold">{t.assignedTo?.name || "Unassigned"}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-bold">{t.priority}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column — Project Info */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 flex flex-col gap-5" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
          <h2 className="m-0 text-sm md:text-base font-extrabold text-slate-800">Project Info</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-400">Status</span>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-400">Mentor</span>
              <span className="font-bold text-slate-700">{project.mentorId?.name || "None"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-400">Mentees</span>
              <span className="font-bold text-slate-700">{project.mentees?.length || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-400">Tasks</span>
              <span className="font-bold text-slate-700">{tasks.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-400">Start</span>
              <span className="font-bold text-slate-700">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-400">End</span>
              <span className="font-bold text-slate-700">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
