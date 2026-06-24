import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
import TaskSubmitModal from "./TaskSubmitModal";

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

  // Toast
  const [toast, setToast] = useState(null);

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

  // ── Toast helper ───────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── "Start Task" button — changes status TODO → IN_PROGRESS ───────────
  const handleStartTask = async (taskId) => {
    setStartingTaskId(taskId);
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: "IN_PROGRESS" });
      showToast("🚀 Task started!");
      loadMyTasks();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to start task.",
        "error"
      );
    } finally {
      setStartingTaskId(null);
    }
  };

  // ── After successful submission from modal ─────────────────────────────
  const handleSubmitSuccess = () => {
    setSubmitTask(null);
    showToast("✅ Work submitted! Your mentor will review it.");
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
    IN_PROGRESS:     "bg-blue-50 text-blue-600 border-blue-100",
    SUBMITTED:       "bg-amber-50 text-amber-600 border-amber-100",
    UNDER_REVIEW:    "bg-purple-50 text-purple-600 border-purple-100",
    APPROVED:        "bg-emerald-50 text-emerald-600 border-emerald-100",
    REVISION_NEEDED: "bg-red-50 text-red-600 border-red-100",
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
    LOW:    "bg-slate-100 text-slate-500",
    MEDIUM: "bg-amber-50 text-amber-600",
    HIGH:   "bg-red-50 text-red-600",
  };

  const allStatuses = [
    "ALL", "TODO", "IN_PROGRESS", "SUBMITTED",
    "UNDER_REVIEW", "APPROVED", "REVISION_NEEDED",
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-2xl text-xs font-bold shadow-xl ${
            toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div
        className="bg-white rounded-3xl p-6 border border-slate-100"
        style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}
      >
        <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          My Assigned Tasks
        </h1>
        <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">
          Start tasks, submit your work, and track mentor feedback.
        </p>
      </div>

      {/* Filter toolbar */}
      <div
        className="bg-white rounded-3xl p-5 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4"
        style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}
      >
        <input
          placeholder="Search deliverables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-slate-50 font-sans w-full md:w-48"
        />

        <div className="flex gap-1.5 flex-wrap">
          {allStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === status
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              {status === "ALL" ? "All Tracks" : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      {/* Tasks grid */}
      {loading ? (
        <div
          className="bg-white rounded-3xl p-12 border border-slate-100 text-center text-slate-400 text-xs font-semibold"
          style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}
        >
          Loading tasks...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="bg-white rounded-3xl p-12 border border-slate-100 text-center text-slate-400 text-xs font-semibold"
          style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}
        >
          No tasks match active filter thresholds.
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {filtered.map((task) => {
            const isStarting = startingTaskId === task._id;
            return (
              <div
                key={task._id}
                className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md duration-200"
                style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}
              >
                {/* Top */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded uppercase">
                      {task.projectId?.title || "Project"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                        statusStyles[task.status] || ""
                      }`}
                    >
                      {statusLabels[task.status] || task.status}
                    </span>
                  </div>

                  <h3 className="m-0 text-sm md:text-base font-black text-slate-800 tracking-tight leading-snug">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="m-0 text-slate-400 text-xs font-semibold leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Show mentor feedback when REVISION_NEEDED */}
                  {task.status === "REVISION_NEEDED" && task.feedback && (
                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <div className="text-[10px] font-black text-red-500 uppercase mb-1">
                        Mentor Feedback:
                      </div>
                      <div className="text-xs text-red-800 font-semibold leading-relaxed">
                        "{task.feedback}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-3">
                    <span>
                      DEADLINE:{" "}
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No deadline"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide ${
                        priorityStyles[task.priority] || "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Action button based on task status */}
                  {task.status === "TODO" && (
                    <button
                      onClick={() => handleStartTask(task._id)}
                      disabled={isStarting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors shadow-md shadow-indigo-500/20 border-none disabled:opacity-60"
                      style={{ fontFamily: "inherit" }}
                    >
                      {isStarting ? "Starting..." : "🚀 Start Task"}
                    </button>
                  )}

                  {task.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => setSubmitTask(task)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors shadow-md shadow-blue-500/20 border-none"
                      style={{ fontFamily: "inherit" }}
                    >
                      📤 Submit Work
                    </button>
                  )}

                  {task.status === "REVISION_NEEDED" && (
                    <button
                      onClick={() => setSubmitTask(task)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors shadow-md shadow-orange-500/20 border-none"
                      style={{ fontFamily: "inherit" }}
                    >
                      🔄 Resubmit Work
                    </button>
                  )}

                  {task.status === "SUBMITTED" && (
                    <div className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100">
                      ⏳ Pending Review
                    </div>
                  )}

                  {task.status === "UNDER_REVIEW" && (
                    <div className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100">
                      🔍 Under Review
                    </div>
                  )}

                  {task.status === "APPROVED" && (
                    <div className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100">
                      ✅ Approved
                    </div>
                  )}
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
