import { useState, useEffect, useCallback } from "react";
import StatusBadge from "../ui/StatusBadge";
import ProgressBar from "../ui/ProgressBar";
import Button from "../ui/Button";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useMilestoneStore } from "../../store/milestoneStore";
import { toast } from "react-toastify";

const MILESTONE_STATUSES = ["UPCOMING", "IN_PROGRESS", "COMPLETED", "OVERDUE"];

export default function MilestonesSection({ projectId }) {
  const { user } = useAuthStore();
  const { milestones, setMilestones, currentMilestone, setCurrentMilestone } = useMilestoneStore();

  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  // Create form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formOrder, setFormOrder] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Milestone detail state
  const [detailLoading, setDetailLoading] = useState(false);

  // Milestone-scoped tasks (for Step 2)
  const [milestoneTasks, setMilestoneTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isMentor = user?.role === "MENTOR";
  const canManage = isAdmin || isMentor;

  // ── Load milestones for the project ─────────────────────────────────
  const loadMilestones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/milestones/project/${projectId}`);
      const data = response.data.data.milestones || [];
      // Sort by order client-side
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setMilestones(data);
    } catch (err) {
      console.error("Error loading milestones:", err);
      toast.error("Failed to load milestones.");
    } finally {
      setLoading(false);
    }
  }, [projectId, setMilestones]);

  useEffect(() => {
    loadMilestones();
    return () => {
      setCurrentMilestone(null);
    };
  }, [loadMilestones, setCurrentMilestone]);

  // ── Load milestone detail (with progress) ───────────────────────────
  const loadMilestoneDetail = useCallback(async (milestoneId) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/milestones/${milestoneId}`);
      const { milestone, progress, totalTasks, completedTasks, pendingTasks } = response.data.data;
      setCurrentMilestone({ ...milestone, progress, totalTasks, completedTasks, pendingTasks });
    } catch (err) {
      console.error("Error loading milestone detail:", err);
      toast.error("Failed to load milestone details.");
    } finally {
      setDetailLoading(false);
    }
  }, [setCurrentMilestone]);

  // ── Load tasks for a milestone ──────────────────────────────────────
  const loadTasksForMilestone = useCallback(async (milestoneId) => {
    setTasksLoading(true);
    try {
      const response = await api.get(`/tasks/milestone/${milestoneId}`);
      setMilestoneTasks(response.data.data.tasks || []);
    } catch (err) {
      console.error("Error loading milestone tasks:", err);
      setMilestoneTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // ── Create milestone ────────────────────────────────────────────────
  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setFormLoading(true);
    try {
      await api.post("/milestones", {
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        projectId,
        dueDate: formDueDate || undefined,
        order: formOrder ? parseInt(formOrder, 10) : undefined,
      });
      toast.success("Milestone created successfully!");
      resetForm();
      setShowCreateForm(false);
      loadMilestones();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create milestone.";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Update milestone ────────────────────────────────────────────────
  const handleUpdateMilestone = async (e) => {
    e.preventDefault();
    if (!editingMilestone || !formTitle.trim()) return;

    setFormLoading(true);
    try {
      await api.patch(`/milestones/${editingMilestone._id}`, {
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        dueDate: formDueDate || undefined,
        order: formOrder ? parseInt(formOrder, 10) : undefined,
      });
      toast.success("Milestone updated successfully!");
      resetForm();
      setEditingMilestone(null);
      loadMilestones();
      // Refresh detail if viewing this milestone
      if (currentMilestone?._id === editingMilestone._id) {
        loadMilestoneDetail(editingMilestone._id);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update milestone.";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Update milestone status ─────────────────────────────────────────
  const handleStatusChange = async (milestoneId, status) => {
    try {
      await api.patch(`/milestones/${milestoneId}/status`, { status });
      toast.success("Milestone status updated!");
      loadMilestones();
      if (currentMilestone?._id === milestoneId) {
        loadMilestoneDetail(milestoneId);
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // ── Delete milestone ────────────────────────────────────────────────
  const handleDeleteMilestone = async (milestoneId) => {
    const confirmed = window.confirm("Delete this milestone? This cannot be undone.");
    if (!confirmed) return;

    try {
      await api.delete(`/milestones/${milestoneId}`);
      toast.success("Milestone deleted.");
      if (currentMilestone?._id === milestoneId) {
        setCurrentMilestone(null);
      }
      loadMilestones();
    } catch (err) {
      toast.error("Failed to delete milestone.");
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDesc("");
    setFormDueDate("");
    setFormOrder("");
  };

  const startEdit = (milestone) => {
    setEditingMilestone(milestone);
    setFormTitle(milestone.title || "");
    setFormDesc(milestone.description || "");
    setFormDueDate(milestone.dueDate ? milestone.dueDate.split("T")[0] : "");
    setFormOrder(milestone.order?.toString() || "");
    setShowCreateForm(false);
  };

  const openDetail = (milestone) => {
    loadMilestoneDetail(milestone._id);
    loadTasksForMilestone(milestone._id);
  };

  // ── Milestone Detail View ───────────────────────────────────────────
  if (currentMilestone) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Back button + title */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => { setCurrentMilestone(null); setMilestoneTasks([]); }}
              className="w-10 h-10 p-0 flex items-center justify-center text-lg rounded-lg"
            >
              ←
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="m-0 text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  {currentMilestone.title}
                </h2>
                <StatusBadge status={currentMilestone.status} />
              </div>
              <p className="m-0 mt-1 text-slate-500 text-sm">Milestone progress & tasks</p>
            </div>
          </div>

          {canManage && (
            <div className="flex gap-2">
              <select
                value={currentMilestone.status}
                onChange={(e) => handleStatusChange(currentMilestone._id, e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {MILESTONE_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
              {isAdmin && (
                <Button variant="danger" onClick={() => handleDeleteMilestone(currentMilestone._id)}>
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Progress stats */}
        {detailLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading milestone details...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
              <span className="block text-3xl font-bold text-slate-900">{currentMilestone.progress ?? 0}%</span>
              <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Progress</span>
              <div className="mt-3">
                <ProgressBar value={currentMilestone.progress ?? 0} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
              <span className="block text-3xl font-bold text-slate-900">{currentMilestone.totalTasks ?? 0}</span>
              <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Tasks</span>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
              <span className="block text-3xl font-bold text-emerald-600">{currentMilestone.completedTasks ?? 0}</span>
              <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Completed</span>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
              <span className="block text-3xl font-bold text-amber-600">{currentMilestone.pendingTasks ?? 0}</span>
              <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Pending</span>
            </div>
          </div>
        )}

        {/* Description */}
        {currentMilestone.description && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="m-0 mb-3 text-base font-bold text-slate-900">Description</h3>
            <p className="m-0 text-slate-700 text-sm leading-relaxed">{currentMilestone.description}</p>
          </div>
        )}

        {/* Due Date */}
        {currentMilestone.dueDate && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex gap-6 text-sm text-slate-700">
              <div>
                <span className="block text-xs text-slate-500 font-semibold uppercase mb-1">Due Date</span>
                {new Date(currentMilestone.dueDate).toLocaleDateString()}
              </div>
              <div>
                <span className="block text-xs text-slate-500 font-semibold uppercase mb-1">Order</span>
                {currentMilestone.order ?? "—"}
              </div>
            </div>
          </div>
        )}

        {/* Milestone Tasks List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h3 className="m-0 text-base font-bold text-slate-900">
              Milestone Tasks ({milestoneTasks.length})
            </h3>
          </div>
          {tasksLoading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading tasks...</div>
          ) : milestoneTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No tasks linked to this milestone yet.</div>
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
                  {milestoneTasks.map(t => (
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
    );
  }

  // ── Milestones List View ────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <h2 className="m-0 text-lg font-bold text-slate-900 tracking-tight">Project Milestones</h2>
          <p className="m-0 mt-1 text-slate-500 text-sm">Checkpoints and deliverable gates for this project.</p>
        </div>
        {canManage && (
          <Button
            onClick={() => { setShowCreateForm(!showCreateForm); setEditingMilestone(null); resetForm(); }}
          >
            {showCreateForm ? "Cancel" : "+ Add Milestone"}
          </Button>
        )}
      </div>

      {/* Create / Edit Form */}
      {(showCreateForm || editingMilestone) && canManage && (
        <form
          onSubmit={editingMilestone ? handleUpdateMilestone : handleCreateMilestone}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col gap-5 shadow-sm"
        >
          <h3 className="m-0 text-base font-bold text-slate-900">
            {editingMilestone ? "Edit Milestone" : "Create New Milestone"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Title *</label>
              <input
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Phase 1 Completion"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                disabled={formLoading}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Describe this milestone..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              style={{ minHeight: 80 }}
              disabled={formLoading}
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-semibold text-slate-700 mb-2">Order</label>
            <input
              type="number"
              value={formOrder}
              onChange={(e) => setFormOrder(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              disabled={formLoading}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={formLoading}>
              {formLoading ? "Saving..." : editingMilestone ? "Update Milestone" : "Create Milestone"}
            </Button>
            {editingMilestone && (
              <Button type="button" variant="secondary" onClick={() => { setEditingMilestone(null); resetForm(); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {/* Milestones List */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">Loading milestones...</div>
      ) : milestones.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
          No milestones have been created for this project yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {milestones.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openDetail(m)}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                    {m.order || "#"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="m-0 text-sm font-bold text-slate-900 truncate">{m.title}</h3>
                    {m.dueDate && (
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        Due: {new Date(m.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={m.status} />

                  {canManage && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={m.status}
                        onChange={(e) => handleStatusChange(m._id, e.target.value)}
                        className="px-2 py-1.5 rounded-md border border-slate-300 text-xs outline-none focus:border-blue-500 bg-white"
                      >
                        {MILESTONE_STATUSES.map(s => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                      <Button
                        variant="secondary"
                        onClick={() => startEdit(m)}
                        className="px-2 py-1 text-xs"
                      >
                        Edit
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteMilestone(m._id)}
                          className="px-2 py-1 text-xs"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {m.description && (
                <p className="m-0 mt-3 text-slate-600 text-sm leading-relaxed line-clamp-2">{m.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
