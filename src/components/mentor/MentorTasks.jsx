import { useState, useEffect, useCallback } from "react";
import StatusBadge from "../ui/StatusBadge";
import { useAuthStore } from "../../store/authStore";
import { useTaskStore } from "../../store/taskStore";
import api from "../../lib/api";
import { toast } from "react-toastify";

export default function MentorTasks() {
  const [projects, setProjects] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selection state for Task Inspector Drawer
  const [selectedTask, setSelectedTask] = useState(null);

  // Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskMenteeId, setTaskMenteeId] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const { user } = useAuthStore();
  const { tasks, setTasks, removeTask } = useTaskStore();

  // ── Fetch all tasks from backend ────────────────────────────────────
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/tasks", { params: { limit: 50 } });
      setTasks(response.data.data.tasks || []);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [setTasks]);

  // ── Load projects for dropdown ──────────────────────────────────────
  const loadProjects = useCallback(async () => {
    try {
      const response = await api.get("/projects", { params: { limit: 50 } });
      setProjects(response.data.data.projects || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, []);

  // ── Load mentees for dropdown ───────────────────────────────────────
  const loadMentees = useCallback(async () => {
    try {
      const response = await api.get("/users/mentees", { params: { limit: 100 } });
      setMentees(response.data.data.users || []);
    } catch (err) {
      console.error("Error fetching mentees:", err);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadProjects();
    loadMentees();
  }, [loadTasks, loadProjects, loadMentees]);

  // ── Create task ─────────────────────────────────────────────────────
  const handleLaunchTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskMenteeId || !taskProjectId) return;

    setCreateLoading(true);
    setCreateError(null);

    try {
      await api.post("/tasks", {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        projectId: taskProjectId,
        assignedTo: taskMenteeId,
        priority: taskPriority,
        dueDate: taskDeadline,
      });
      // Reset form and close modal
      setTaskTitle("");
      setTaskDesc("");
      setTaskMenteeId("");
      setTaskPriority("MEDIUM");
      setTaskDeadline("");
      setShowCreateModal(false);
      loadTasks(); // Refresh list
      toast.success("Task assigned successfully!");
    } catch (err) {
      if (err.response?.status === 400) {
        setCreateError(err.response.data.message || "Validation error. Check all fields.");
      } else {
        setCreateError("Failed to create task. Please try again.");
      }
      console.error("Create task error:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Delete task ─────────────────────────────────────────────────────
  const handleDeleteTask = async (taskId, e) => {
    if (e) e.stopPropagation();
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      removeTask(taskId);
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(null);
      }
      toast.success("Task deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete task.");
      console.error("Delete task error:", err);
    }
  };

  // ── Filter Logic ────────────────────────────────────────────────────
  const filtered = tasks
    .filter(t => statusFilter === "ALL" || t.status === statusFilter)
    .filter(t => {
      if (projectFilter === "ALL") return true;
      const pId = typeof t.projectId === "object" ? t.projectId?._id : t.projectId;
      return pId === projectFilter;
    })
    .filter(t => {
      const title = (t.title || "").toLowerCase();
      const assignee = (t.assignedTo?.name || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      return title.includes(query) || assignee.includes(query);
    });

  // Status badge styles matching backend status values
  const statusStyles = {
    TODO: "bg-slate-100 text-slate-600 border-slate-200",
    IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100",
    SUBMITTED: "bg-amber-50 text-amber-600 border-amber-100",
    UNDER_REVIEW: "bg-purple-50 text-purple-600 border-purple-100",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REVISION_NEEDED: "bg-red-50 text-red-600 border-red-100",
  };

  const statusLabels = {
    TODO: "Todo",
    IN_PROGRESS: "In Progress",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    REVISION_NEEDED: "Revision Needed",
  };

  // Priority badge styles
  const priorityStyles = {
    LOW: "bg-slate-100 text-slate-500",
    MEDIUM: "bg-amber-50 text-amber-600",
    HIGH: "bg-red-50 text-red-600",
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">
      {/* Title & Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">Project Tasks Workspace</h1>
          <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Assign deliverables, review uploads, and comment on milestones.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl border-none text-xs cursor-pointer transition-colors shadow-lg shadow-indigo-500/20"
          style={{ fontFamily: "inherit" }}
        >
          + Assign Task
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-slate-50 font-sans w-full sm:w-48"
          />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold text-slate-600 outline-none w-full sm:w-44"
            style={{ fontFamily: "inherit" }}
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {["ALL", "TODO", "IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REVISION_NEEDED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === status
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              {status === "ALL" ? "All" : statusLabels[status] || status}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      {/* Split catalog layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Table of Tasks */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden flex-1 w-full animate-fade-in" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">No tasks assigned matching filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-130">
                <thead>
                  <tr className="bg-slate-50">
                    {["Task Title", "Project", "Assignee", "Priority", "Due Date", "Status", ""].map(h => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr
                      key={t._id}
                      onClick={() => setSelectedTask(t)}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors duration-150 ${
                        selectedTask && selectedTask._id === t._id ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-black text-slate-800 text-xs md:text-sm">{t.title}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-semibold">{t.projectId?.title || "—"}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-bold">{t.assignedTo?.name || "Unassigned"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${priorityStyles[t.priority] || "bg-slate-100 text-slate-500"}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-semibold">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${statusStyles[t.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {statusLabels[t.status] || t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => handleDeleteTask(t._id, e)}
                          className="bg-transparent border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-lg text-[10px] font-bold text-red-500 cursor-pointer transition-colors"
                          style={{ fontFamily: "inherit" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Task Inspector Sidebar Drawer */}
        {selectedTask && (
          <div
            className="w-full xl:w-80 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-6 shrink-0 relative animate-fade-in"
            style={{ boxShadow: "0 4px 20px rgba(99,102,241,0.06)" }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center cursor-pointer border-none text-sm transition-colors"
            >
              ✕
            </button>

            {/* Title / Description */}
            <div>
              <div className="flex gap-2 items-center mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-slate-500 font-bold text-[9px] uppercase">
                  {selectedTask.projectId?.title || "Project"}
                </span>
                <span className={`px-2 py-0.5 border rounded-lg text-[9px] font-bold uppercase ${statusStyles[selectedTask.status] || ""}`}>
                  {statusLabels[selectedTask.status] || selectedTask.status}
                </span>
              </div>
              <h3 className="m-0 text-base font-black text-slate-800 leading-snug">{selectedTask.title}</h3>
              <p className="m-0 mt-2 text-slate-400 text-xs font-semibold leading-relaxed">
                {selectedTask.description || "Task instructions and guidelines."}
              </p>
            </div>

            <hr className="border-0 border-t border-slate-100 m-0" />

            {/* Task variables */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">ASSIGNEE:</span>
                <span className="font-extrabold text-slate-700">{selectedTask.assignedTo?.name || "Unassigned"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">ASSIGNED BY:</span>
                <span className="font-extrabold text-slate-700">{selectedTask.assignedBy?.name || "—"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">PRIORITY:</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${priorityStyles[selectedTask.priority] || ""}`}>
                  {selectedTask.priority}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">DUE DATE:</span>
                <span className="font-extrabold text-indigo-600">
                  {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "Not set"}
                </span>
              </div>
            </div>

            <hr className="border-0 border-t border-slate-100 m-0" />

            {/* Delete task action */}
            <button
              onClick={() => handleDeleteTask(selectedTask._id)}
              className="w-full bg-transparent border border-red-200 hover:border-red-400 hover:bg-red-50 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 cursor-pointer transition-colors"
              style={{ fontFamily: "inherit" }}
            >
              Delete This Task
            </button>
          </div>
        )}
      </div>

      {/* Assign Task Modal overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-250 p-4" style={{ background: "rgba(15,23,42,0.5)" }} onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <form onSubmit={handleLaunchTask} className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col gap-5 animate-fade-in" style={{ boxShadow: "0 24px 80px rgba(99,102,241,0.15)" }}>
            <div>
              <h3 className="m-0 text-lg font-black text-slate-800">Assign New Task</h3>
              <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Assign milestone deliverables under active projects.</p>
            </div>

            {createError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-semibold">
                ⚠️ {createError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Project</label>
                <select
                  required
                  value={taskProjectId}
                  onChange={(e) => {
                    setTaskProjectId(e.target.value);
                    setTaskMenteeId("");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-white"
                  style={{ fontFamily: "inherit" }}
                  disabled={createLoading}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Assign To (Mentee)</label>
                <select
                  required
                  value={taskMenteeId}
                  onChange={(e) => setTaskMenteeId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-white"
                  style={{ fontFamily: "inherit" }}
                  disabled={createLoading}
                >
                  <option value="">-- Select Mentee --</option>
                  {mentees.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Task Title</label>
                <input
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Login Page"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 font-sans"
                  disabled={createLoading}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Describe guidelines..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 resize-none font-sans"
                  style={{ minHeight: 60 }}
                  disabled={createLoading}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-white"
                    style={{ fontFamily: "inherit" }}
                    disabled={createLoading}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Due Date</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-white"
                    style={{ fontFamily: "inherit" }}
                    disabled={createLoading}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ fontFamily: "inherit" }}
                disabled={createLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="flex-1 py-3 rounded-xl border-none bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white cursor-pointer transition-colors shadow-md disabled:opacity-60"
                style={{ fontFamily: "inherit" }}
              >
                {createLoading ? "Creating..." : "Launch Task"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
