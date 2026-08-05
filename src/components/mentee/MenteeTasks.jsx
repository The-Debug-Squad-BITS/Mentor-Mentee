import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
import TaskSubmitModal from "./TaskSubmitModal";
import { toast } from "react-toastify";
import { formatUIDate } from "../../lib/datetime";
import Button from "../ui/Button";
import CommentSection from "../ui/CommentSection";

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
    TODO:            "bg-slate-100 text-slate-600 border-slate-200",
    IN_PROGRESS:     "bg-blue-50 text-blue-700 border-blue-200",
    SUBMITTED:       "bg-amber-50 text-amber-700 border-amber-200",
    UNDER_REVIEW:    "bg-purple-50 text-purple-700 border-purple-200",
    APPROVED:        "bg-emerald-50 text-emerald-700 border-emerald-200",
    REVISION_NEEDED: "bg-red-50 text-red-700 border-red-200",
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
    LOW:    "bg-slate-100 text-slate-600 border-slate-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HIGH:   "bg-red-50 text-red-700 border-red-200",
  };

  const allStatuses = [
    "ALL", "TODO", "IN_PROGRESS", "SUBMITTED",
    "UNDER_REVIEW", "APPROVED", "REVISION_NEEDED",
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          My Assigned Tasks
        </h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">
          Start tasks, submit your work, and track mentor feedback.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <input
          placeholder="Search deliverables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-64 px-4 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
        />

        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg overflow-x-auto w-full md:w-auto">
          {allStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {status === "ALL" ? "All Tracks" : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Tasks grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
          Loading tasks...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
          No tasks match active filter thresholds.
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {filtered.map((task) => {
            const isStarting = startingTaskId === task._id;
            return (
              <div
                key={task._id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5 transition-all hover:-translate-y-1 hover:shadow-lg duration-200 shadow-sm"
              >
                {/* Top */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-[10px] font-semibold text-slate-600 rounded-md uppercase tracking-wider border border-slate-200">
                      {task.projectId?.title || "Project"}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        statusStyles[task.status] || ""
                      }`}
                    >
                      {statusLabels[task.status] || task.status}
                    </span>
                  </div>

                  {/* Milestone badge — shown when task is linked to a milestone */}
                  {task.milestoneId && (
                    <div className="flex items-center gap-1.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                      <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                        {task.milestoneId?.title || "Milestone"}
                      </span>
                    </div>
                  )}

                  <h3 className="m-0 text-base md:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="m-0 text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Show mentor feedback when REVISION_NEEDED */}
                  {task.status === "REVISION_NEEDED" && task.feedback && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">
                        Mentor Feedback:
                      </div>
                      <div className="text-sm text-red-900 leading-relaxed">
                        "{task.feedback}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium border-t border-slate-100 pt-4">
                    <span>
                      Deadline:{" "}
                      <span className="text-slate-900">
                        {task.dueDate
                          ? formatUIDate(new Date(task.dueDate))
                          : "None"}
                      </span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${
                        priorityStyles[task.priority] || "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  {/* Action button based on task status */}
                  {task.status === "TODO" && (
                    <Button
                      onClick={() => handleStartTask(task._id)}
                      disabled={isStarting}
                      className="w-full justify-center text-sm py-2.5"
                    >
                      {isStarting ? "Starting..." : "🚀 Start Task"}
                    </Button>
                  )}

                  {task.status === "IN_PROGRESS" && (
                    <Button
                      onClick={() => setSubmitTask(task)}
                      className="w-full justify-center text-sm py-2.5 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                    >
                      📤 Submit Work
                    </Button>
                  )}

                  {task.status === "REVISION_NEEDED" && (
                    <Button
                      onClick={() => setSubmitTask(task)}
                      className="w-full justify-center text-sm py-2.5 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white"
                    >
                      🔄 Resubmit Work
                    </Button>
                  )}

                  {task.status === "SUBMITTED" && (
                    <div className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                      ⏳ Pending Review
                    </div>
                  )}

                  {task.status === "UNDER_REVIEW" && (
                    <div className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200">
                      🔍 Under Review
                    </div>
                  )}

                  {task.status === "APPROVED" && (
                    <div className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      ✅ Approved
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
