import { useState, useEffect, useCallback } from "react";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";
import { useTaskStore } from "../../store/taskStore";
import api from "../../lib/api";
import { toast } from "react-toastify";
import CommentSection from "../ui/CommentSection";

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
  const [taskMilestoneId, setTaskMilestoneId] = useState("");
  const [projectMilestones, setProjectMilestones] = useState([]);
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

  // ── Load milestones when project changes ────────────────────────────
  useEffect(() => {
    const loadMilestones = async () => {
      if (!taskProjectId) {
        setProjectMilestones([]);
        setTaskMilestoneId("");
        return;
      }
      try {
        const response = await api.get(`/milestones/project/${taskProjectId}`);
        setProjectMilestones(response.data.data.milestones || []);
      } catch (err) {
        console.error("Error loading milestones for project:", err);
        setProjectMilestones([]);
      }
    };
    loadMilestones();
  }, [taskProjectId]);

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
        milestoneId: taskMilestoneId || null,
      });
      // Reset form and close modal
      setTaskTitle("");
      setTaskDesc("");
      setTaskMenteeId("");
      setTaskPriority("MEDIUM");
      setTaskDeadline("");
      setTaskMilestoneId("");
      setProjectMilestones([]);
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
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    SUBMITTED: "bg-amber-50 text-amber-700 border-amber-200",
    UNDER_REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REVISION_NEEDED: "bg-red-50 text-red-700 border-red-200",
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
    LOW: "bg-slate-100 text-slate-600 border-slate-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HIGH: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Title & Toolbar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Project Tasks Workspace</h1>
          <p className="m-0 mt-1 text-slate-500 text-sm">Assign deliverables, review uploads, and comment on milestones.</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-sm font-medium shrink-0"
        >
          + Assign Task
        </Button>
      </div>

      {/* Filter Options */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
          <input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
          />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full md:w-48 px-4 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-colors"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg overflow-x-auto w-full md:w-auto">
          {["ALL", "TODO", "IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REVISION_NEEDED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {status === "ALL" ? "All" : statusLabels[status] || status}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Split catalog layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Table of Tasks */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1 w-full shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No tasks assigned matching filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50">
                    {["Task Title", "Project", "Assignee", "Priority", "Due Date", "Status", ""].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(t => (
                    <tr
                      key={t._id}
                      onClick={() => setSelectedTask(t)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedTask && selectedTask._id === t._id ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{t.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{t.projectId?.title || "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{t.assignedTo?.name || "Unassigned"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${priorityStyles[t.priority] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusStyles[t.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {statusLabels[t.status] || t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="danger"
                          onClick={(e) => handleDeleteTask(t._id, e)}
                          className="px-3 py-1.5 text-xs"
                        >
                          Delete
                        </Button>
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
          <div className="w-full xl:w-96 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 shrink-0 relative shadow-md">
            {/* Close */}
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center cursor-pointer border-none text-sm transition-colors"
            >
              ✕
            </button>

            {/* Title / Description */}
            <div>
              <div className="flex gap-2 items-center mb-3 flex-wrap">
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-slate-600 font-semibold text-[10px] uppercase tracking-wider">
                  {selectedTask.projectId?.title || "Project"}
                </span>
                <span className={`px-2.5 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wider ${statusStyles[selectedTask.status] || ""}`}>
                  {statusLabels[selectedTask.status] || selectedTask.status}
                </span>
              </div>
              <h3 className="m-0 text-lg font-bold text-slate-900 leading-snug">{selectedTask.title}</h3>
              <p className="m-0 mt-2 text-slate-600 text-sm leading-relaxed">
                {selectedTask.description || "Task instructions and guidelines."}
              </p>
            </div>

            <hr className="border-0 border-t border-slate-200 m-0" />

            {/* Task variables */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-500">Assignee</span>
                <span className="font-bold text-slate-900">{selectedTask.assignedTo?.name || "Unassigned"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-500">Assigned By</span>
                <span className="font-bold text-slate-900">{selectedTask.assignedBy?.name || "—"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-500">Priority</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${priorityStyles[selectedTask.priority] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {selectedTask.priority}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-500">Due Date</span>
                <span className="font-bold text-slate-900">
                  {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "Not set"}
                </span>
              </div>
            </div>

            <hr className="border-0 border-t border-slate-200 m-0" />

            {/* Delete task action */}
            <Button
              variant="danger"
              onClick={() => handleDeleteTask(selectedTask._id)}
              className="w-full justify-center text-sm py-2.5"
            >
              Delete This Task
            </Button>

            {/* Task comments */}
            <CommentSection entityType="TASK" entityId={selectedTask._id} />
          </div>
        )}
      </div>

      {/* Assign Task Modal overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-slate-900/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <form onSubmit={handleLaunchTask} className="bg-white rounded-xl p-8 w-full max-w-lg flex flex-col gap-6 shadow-xl animate-fade-in">
            <div>
              <h3 className="m-0 text-xl font-bold text-slate-900">Assign New Task</h3>
              <p className="m-0 mt-1 text-slate-500 text-sm">Assign milestone deliverables under active projects.</p>
            </div>

            {createError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 shadow-sm">
                ⚠️ {createError}
              </div>
            )}

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Project</label>
                  <select
                    required
                    value={taskProjectId}
                    onChange={(e) => {
                      setTaskProjectId(e.target.value);
                      setTaskMenteeId("");
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                    disabled={createLoading}
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Assign To (Mentee)</label>
                  <select
                    required
                    value={taskMenteeId}
                    onChange={(e) => setTaskMenteeId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                    disabled={createLoading}
                  >
                    <option value="">-- Select Mentee --</option>
                    {mentees.map(m => (
                      <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Task Title</label>
                <input
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Login Page"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  disabled={createLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Describe guidelines..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  style={{ minHeight: 80 }}
                  disabled={createLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                    disabled={createLoading}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                    disabled={createLoading}
                  />
                </div>
              </div>

              {/* Milestone Dropdown (Phase 2) */}
              {taskProjectId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Milestone (optional)</label>
                  <select
                    value={taskMilestoneId}
                    onChange={(e) => setTaskMilestoneId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                    disabled={createLoading}
                  >
                    <option value="">No Milestone</option>
                    {projectMilestones.map(m => (
                      <option key={m._id} value={m._id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
              >
                {createLoading ? "Creating..." : "Launch Task"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
