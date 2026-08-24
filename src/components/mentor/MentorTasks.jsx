import { useState, useEffect, useCallback } from "react";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";
import { useTaskStore } from "../../store/taskStore";
import api from "../../lib/api";
import { toast } from "react-toastify";
import CommentSection from "../ui/CommentSection";
import { Plus, Search, Trash, Close, Inbox, AlertTriangle, AlertCircle } from "../ui/Icons";

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
    TODO: "bg-slate-50 text-slate-700 border-slate-200",
    IN_PROGRESS: "bg-info-50 text-info-700 border-info-200",
    SUBMITTED: "bg-warning-50 text-warning-700 border-warning-200",
    UNDER_REVIEW: "bg-violet-50 text-violet-700 border-violet-200",
    APPROVED: "bg-success-50 text-success-700 border-success-200",
    REVISION_NEEDED: "bg-danger-50 text-danger-700 border-danger-200",
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
    LOW: "bg-slate-50 text-slate-700 border-slate-200",
    MEDIUM: "bg-warning-50 text-warning-700 border-warning-200",
    HIGH: "bg-danger-50 text-danger-700 border-danger-200",
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Title & Toolbar */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="page-title m-0">Tasks</h1>
          <p className="page-subtitle mt-1">
            Assign deliverables, review uploads, and comment on milestones.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="shrink-0">
          <Plus size={16} /> Assign Task
        </Button>
      </div>

      {/* Filter Options */}
      <div className="card flex flex-col items-stretch justify-between gap-3 p-3 lg:flex-row lg:items-center">
        <div className="flex w-full flex-wrap gap-3 md:flex-nowrap lg:w-auto">
          <div className="relative w-full md:w-64">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tasks"
              className="input-field pl-9"
            />
          </div>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filter by project"
            className="select-field w-full md:w-48"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="tab-strip w-full overflow-x-auto scrollbar-none lg:w-auto">
          {["ALL", "TODO", "IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REVISION_NEEDED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`tab-item ${statusFilter === status ? "tab-item-active" : ""}`}
            >
              {status === "ALL" ? "All" : statusLabels[status] || status}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="notice notice-danger">
          <AlertTriangle size={16} className="mt-px shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Split catalog layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Table of Tasks */}
        <div className="card w-full min-w-0 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex flex-col gap-3 p-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="skeleton h-11 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">
                <Inbox size={22} />
              </span>
              <p className="empty-state-title">No tasks match these filters</p>
              <p className="empty-state-text">
                Clear the search or pick a different status, or assign a new task to get
                started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table min-w-[820px]">
                <thead>
                  <tr>
                    {["Task Title", "Project", "Assignee", "Priority", "Due Date", "Status", ""].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr
                      key={t._id}
                      onClick={() => setSelectedTask(t)}
                      className={`cursor-pointer ${
                        selectedTask && selectedTask._id === t._id ? "bg-brand-50/60" : ""
                      }`}
                    >
                      <td className="font-semibold text-slate-900">{t.title}</td>
                      <td>{t.projectId?.title || "—"}</td>
                      <td className="font-medium">{t.assignedTo?.name || "Unassigned"}</td>
                      <td>
                        <span className={`badge ${priorityStyles[t.priority] || "badge-neutral"}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-slate-500">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <span className={`badge ${statusStyles[t.status] || "badge-neutral"}`}>
                          <span className="badge-dot" />
                          {statusLabels[t.status] || t.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={(e) => handleDeleteTask(t._id, e)}
                          aria-label={`Delete task ${t.title}`}
                          title="Delete task"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400
                            transition-colors hover:bg-danger-50 hover:text-danger-600"
                        >
                          <Trash size={15} />
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
          <div className="card relative flex w-full shrink-0 flex-col gap-5 p-6 shadow-sm xl:w-96">
            {/* Close */}
            <button
              onClick={() => setSelectedTask(null)}
              aria-label="Close task details"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg
                text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Close size={16} />
            </button>

            {/* Title / Description */}
            <div className="pr-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="badge badge-neutral">
                  {selectedTask.projectId?.title || "Project"}
                </span>
                <span className={`badge ${statusStyles[selectedTask.status] || "badge-neutral"}`}>
                  <span className="badge-dot" />
                  {statusLabels[selectedTask.status] || selectedTask.status}
                </span>
              </div>
              <h3 className="m-0 font-display text-[17px] font-bold leading-snug text-slate-900">
                {selectedTask.title}
              </h3>
              <p className="m-0 mt-2 text-[13.5px] leading-relaxed text-slate-600">
                {selectedTask.description || "Task instructions and guidelines."}
              </p>
            </div>

            <hr className="m-0 border-0 border-t border-slate-200" />

            {/* Task variables */}
            <dl className="m-0 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <dt className="font-medium text-slate-500">Assignee</dt>
                <dd className="m-0 font-semibold text-slate-900">
                  {selectedTask.assignedTo?.name || "Unassigned"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <dt className="font-medium text-slate-500">Assigned By</dt>
                <dd className="m-0 font-semibold text-slate-900">
                  {selectedTask.assignedBy?.name || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <dt className="font-medium text-slate-500">Priority</dt>
                <dd className="m-0">
                  <span className={`badge ${priorityStyles[selectedTask.priority] || "badge-neutral"}`}>
                    {selectedTask.priority}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <dt className="font-medium text-slate-500">Due Date</dt>
                <dd className="m-0 font-semibold text-slate-900">
                  {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "Not set"}
                </dd>
              </div>
            </dl>

            <hr className="m-0 border-0 border-t border-slate-200" />

            {/* Delete task action */}
            <Button
              variant="danger"
              onClick={() => handleDeleteTask(selectedTask._id)}
              className="w-full"
            >
              <Trash size={16} /> Delete This Task
            </Button>

            {/* Task comments */}
            <CommentSection entityType="TASK" entityId={selectedTask._id} />
          </div>
        )}
      </div>

      {/* Assign Task Modal overlay */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <form onSubmit={handleLaunchTask} className="modal-panel max-w-lg flex flex-col gap-6 p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="m-0 font-display text-[17px] font-bold tracking-tight text-slate-900">
                  Assign New Task
                </h3>
                <p className="m-0 mt-1 text-[13px] text-slate-500">
                  Assign milestone deliverables under active projects.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                aria-label="Close"
                className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                  text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <Close size={17} />
              </button>
            </div>

            {createError && (
              <div className="notice notice-danger">
                <AlertCircle size={16} className="mt-px shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="field-label">Project</label>
                  <select
                    required
                    value={taskProjectId}
                    onChange={(e) => {
                      setTaskProjectId(e.target.value);
                      setTaskMenteeId("");
                    }}
                    className="select-field"
                    disabled={createLoading}
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Assign To (Mentee)</label>
                  <select
                    required
                    value={taskMenteeId}
                    onChange={(e) => setTaskMenteeId(e.target.value)}
                    className="select-field"
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
                <label className="field-label">Task Title</label>
                <input
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Login Page"
                  className="input-field"
                  disabled={createLoading}
                />
              </div>

              <div>
                <label className="field-label">Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Describe guidelines..."
                  className="textarea-field min-h-20 resize-none"
                  disabled={createLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="field-label">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="select-field"
                    disabled={createLoading}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Due Date</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="select-field"
                    disabled={createLoading}
                  />
                </div>
              </div>

              {/* Milestone Dropdown (Phase 2) */}
              {taskProjectId && (
                <div>
                  <label className="field-label">Milestone (optional)</label>
                  <select
                    value={taskMilestoneId}
                    onChange={(e) => setTaskMilestoneId(e.target.value)}
                    className="select-field"
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
