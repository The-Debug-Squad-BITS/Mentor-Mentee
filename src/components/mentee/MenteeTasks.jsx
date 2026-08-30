import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
import TaskSubmitModal from "./TaskSubmitModal";
import { toast } from "react-toastify";
import { formatUIDate } from "../../lib/datetime";
import Button from "../ui/Button";
import CommentSection from "../ui/CommentSection";
import {
  Search,
  Layers,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  Upload,
  Refresh,
  Inbox,
} from "../ui/Icons";

export default function MenteeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Task selected for submission modal
  const [submitTask, setSubmitTask] = useState(null);

  // Per-task "Start Task" loading
  const [startingTaskId, setStartingTaskId] = useState(null);

  const { token } = useAuthStore();

  // ── Fetch mentee's assigned tasks ──────────────────────────────────────
  // Backend auto-filters tasks to only those assigned to the logged-in mentee
  const loadMyTasks = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (token) loadMyTasks();
  }, [token, loadMyTasks]);

  // ── "Start Task" button — changes status TODO → IN_PROGRESS ───────────
  const handleStartTask = async (taskId) => {
    setStartingTaskId(taskId);
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: "IN_PROGRESS" });
      toast.success("Task started!");
      loadMyTasks();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to start task."
      );
    } finally {
      setStartingTaskId(null);
    }
  };

  // ── After successful submission from modal ─────────────────────────────
  const handleSubmitSuccess = () => {
    setSubmitTask(null);
    toast.success("Work submitted! Your mentor will review it.");
    loadMyTasks();
  };

  // ── Filter logic ───────────────────────────────────────────────────────
  const filtered = tasks
    .filter((t) => statusFilter === "ALL" || t.status === statusFilter)
    .filter((t) =>
      (t.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  const statusStyles = {
    TODO:            "bg-slate-50 text-slate-700 border-slate-200",
    IN_PROGRESS:     "bg-info-50 text-info-700 border-info-200",
    SUBMITTED:       "bg-warning-50 text-warning-700 border-warning-200",
    UNDER_REVIEW:    "bg-violet-50 text-violet-700 border-violet-200",
    APPROVED:        "bg-success-50 text-success-700 border-success-200",
    REVISION_NEEDED: "bg-danger-50 text-danger-700 border-danger-200",
  };

  const statusLabels = {
    TODO:            "To Do",
    IN_PROGRESS:     "In Progress",
    SUBMITTED:       "Submitted",
    UNDER_REVIEW:    "Under Review",
    APPROVED:        "Approved",
    REVISION_NEEDED: "Revision Needed",
  };

  const priorityStyles = {
    LOW:    "bg-slate-50 text-slate-600 border-slate-200",
    MEDIUM: "bg-warning-50 text-warning-700 border-warning-200",
    HIGH:   "bg-danger-50 text-danger-700 border-danger-200",
  };

  const allStatuses = [
    "ALL", "TODO", "IN_PROGRESS", "SUBMITTED",
    "UNDER_REVIEW", "APPROVED", "REVISION_NEEDED",
  ];

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="page-title m-0">My Assigned Tasks</h1>
        <p className="page-subtitle mt-1">
          Start tasks, submit your work, and track mentor feedback.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="card flex flex-col items-stretch justify-between gap-3 p-3 md:flex-row md:items-center">
        <div className="relative w-full md:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search deliverables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tasks"
            className="input-field pl-9"
          />
        </div>

        <div className="tab-strip w-full overflow-x-auto md:w-auto scrollbar-none">
          {allStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`tab-item ${statusFilter === status ? "tab-item-active" : ""}`}
            >
              {status === "ALL" ? "All Tracks" : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="notice notice-danger">
          <AlertTriangle size={16} className="mt-px shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tasks grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card flex flex-col gap-4 p-5">
              <div className="flex justify-between gap-3">
                <span className="skeleton h-5 w-28" />
                <span className="skeleton h-5 w-20" />
              </div>
              <span className="skeleton h-6 w-3/4" />
              <span className="skeleton h-4 w-full" />
              <span className="skeleton h-4 w-2/3" />
              <span className="skeleton mt-2 h-9 w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">
              <Inbox size={22} />
            </span>
            <p className="empty-state-title">
              {tasks.length === 0 ? "No tasks assigned yet" : "No tasks match this filter"}
            </p>
            <p className="empty-state-text">
              {tasks.length === 0
                ? "Tasks your mentor assigns to you will show up here, with their deadline and priority."
                : "Try a different status filter, or clear your search to see everything."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((task) => {
            const isStarting = startingTaskId === task._id;
            return (
              <div
                key={task._id}
                className="card flex flex-col justify-between gap-5 p-5 transition-shadow duration-200 hover:shadow-md"
              >
                {/* Top */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="badge badge-neutral">
                      {task.projectId?.title || "Project"}
                    </span>
                    <span
                      className={`badge ${statusStyles[task.status] || "badge-neutral"}`}
                    >
                      <span className="badge-dot" />
                      {statusLabels[task.status] || task.status}
                    </span>
                  </div>

                  {/* Milestone badge — shown when task is linked to a milestone */}
                  {task.milestoneId && (
                    <div className="flex items-center gap-1.5 text-brand-600">
                      <Layers size={13} />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">
                        {task.milestoneId?.title || "Milestone"}
                      </span>
                    </div>
                  )}

                  <h3 className="m-0 font-display text-[16px] font-bold leading-snug tracking-tight text-slate-900">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="m-0 line-clamp-2 text-[13.5px] leading-relaxed text-slate-600">
                      {task.description}
                    </p>
                  )}

                  {/* Show mentor feedback when REVISION_NEEDED */}
                  {task.status === "REVISION_NEEDED" && task.feedback && (
                    <div className="mt-1 rounded-xl border border-danger-200 bg-danger-50/60 p-3.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-danger-700">
                        <Refresh size={13} /> Mentor Feedback
                      </div>
                      <div className="text-[13px] leading-relaxed text-danger-800">
                        &ldquo;{task.feedback}&rdquo;
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-[12.5px] font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      Deadline:{" "}
                      <span className="font-semibold text-slate-900">
                        {task.dueDate
                          ? formatUIDate(new Date(task.dueDate))
                          : "None"}
                      </span>
                    </span>
                    <span
                      className={`badge ${priorityStyles[task.priority] || "badge-neutral"}`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  {/* Action button based on task status */}
                  {task.status === "TODO" && (
                    <Button
                      onClick={() => handleStartTask(task._id)}
                      disabled={isStarting}
                      className="w-full"
                    >
                      {isStarting ? "Starting..." : "Start Task"}
                    </Button>
                  )}

                  {task.status === "IN_PROGRESS" && (
                    <Button onClick={() => setSubmitTask(task)} className="w-full">
                      <Upload size={16} /> Submit Work
                    </Button>
                  )}

                  {task.status === "REVISION_NEEDED" && (
                    <Button onClick={() => setSubmitTask(task)} className="w-full">
                      <Refresh size={16} /> Resubmit Work
                    </Button>
                  )}

                  {task.status === "SUBMITTED" && (
                    <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-warning-200 bg-warning-50 py-2.5 text-[13.5px] font-semibold text-warning-700">
                      <Clock size={16} /> Pending Review
                    </div>
                  )}

                  {task.status === "UNDER_REVIEW" && (
                    <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 py-2.5 text-[13.5px] font-semibold text-violet-700">
                      <Eye size={16} /> Under Review
                    </div>
                  )}

                  {task.status === "APPROVED" && (
                    <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-success-200 bg-success-50 py-2.5 text-[13.5px] font-semibold text-success-700">
                      <CheckCircle size={16} /> Approved
                    </div>
                  )}

                  {/* Task comments */}
                  <CommentSection entityType="TASK" entityId={task._id} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Work Modal */}
      {submitTask && (
        <TaskSubmitModal
          task={submitTask}
          onClose={() => setSubmitTask(null)}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
