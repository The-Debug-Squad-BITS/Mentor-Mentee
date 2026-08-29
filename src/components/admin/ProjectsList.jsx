import { useState, useEffect, useCallback } from "react";
import { Close, AlertTriangle, AlertCircle, Inbox, Folder, Target, CheckCircle, Clock } from "../ui/Icons";
import StatusBadge from "../ui/StatusBadge";
import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import api from "../../lib/api";
import { useProjectStore } from "../../store/projectStore";
import { toast } from "react-toastify";
import { formatUIDate } from "../../lib/datetime";

export default function ProjectsList({ onViewProject, onRefresh }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  // Starts true so the first paint is a skeleton, not a "no projects" empty state.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Creation modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectStartDate, setNewProjectStartDate] = useState("");
  const [newProjectEndDate, setNewProjectEndDate] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [updatingProjectId, setUpdatingProjectId] = useState(null);

  const { projects, setProjects } = useProjectStore();

  // ── Fetch projects from backend API ─────────────────────────────────
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 50 };
      if (statusFilter !== "All") params.status = statusFilter;
      const response = await api.get("/projects", { params });
      setProjects(response.data.data.projects);
    } catch (err) {
      setError("Failed to load projects. Please try again.");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, [setProjects, statusFilter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // ── Create project ──────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newProjectTitle.trim()) return;
    if (newProjectStartDate && newProjectEndDate && new Date(newProjectEndDate) < new Date(newProjectStartDate)) {
      setCreateError("End date cannot be before start date");
      return;
    }
    setCreateLoading(true);
    setCreateError(null);

    try {
      await api.post("/projects", {
        title: newProjectTitle.trim(),
        description: newProjectDesc.trim(),
        startDate: newProjectStartDate,
        endDate: newProjectEndDate,
      });
      // Reset form and close modal
      setNewProjectTitle("");
      setNewProjectDesc("");
      setNewProjectStartDate("");
      setNewProjectEndDate("");
      setShowCreateModal(false);
      loadProjects(); // Refresh list
      if (onRefresh) onRefresh();
    } catch (err) {
      if (err.response?.status === 400) {
        setCreateError(err.response.data.message || "Validation error. Check all fields.");
      } else {
        setCreateError("Failed to create project. Please try again.");
      }
      console.error("Create project error:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Update project status ───────────────────────────────────────────
  const handleStatusChange = async (projectId, newStatus) => {
    setUpdatingProjectId(projectId);
    try {
      await api.patch(`/projects/${projectId}`, { status: newStatus });
      loadProjects();
      if (onRefresh) onRefresh();
      toast.success(`Project status updated to ${newStatus.toLowerCase()}.`);
    } catch (err) {
      toast.error("Failed to update project status.");
      console.error("Status update error:", err);
    } finally {
      setUpdatingProjectId(null);
    }
  };

  // ── Delete project ──────────────────────────────────────────────────
  const handleDelete = async (projectId) => {
    const confirmed = window.confirm("Delete this project? This cannot be undone.");
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${projectId}`);
      loadProjects();
      if (onRefresh) onRefresh();
      toast.success("Project deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete project.");
      console.error("Delete project error:", err);
    }
  };

  // ── Client-side filter & search ─────────────────────────────────────
  const filtered = projects
    .filter(p => {
      if (statusFilter === "All") return true;
      return p.status?.toUpperCase() === statusFilter.toUpperCase();
    })
    .filter(p =>
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Calculate project status summaries
  const totalProjCount = projects.length;
  const activeProjCount = projects.filter(p => p.status === "ACTIVE").length;
  const completedProjCount = projects.filter(p => p.status === "COMPLETED").length;
  const holdOrPlannedCount = projects.filter(p => p.status === "ON_HOLD" || p.status === "PLANNED").length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Projects summary stats */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon={<Folder size={17} />}
          label="Total Projects"
          value={totalProjCount.toString()}
          badge="Global Catalog"
          badgeColor="blue"
        />
        <StatCard
          icon={<Target size={17} />}
          label="Active"
          value={activeProjCount.toString()}
          badge="In Development"
          badgeColor="green"
        />
        <StatCard
          icon={<CheckCircle size={17} />}
          label="Completed"
          value={completedProjCount.toString()}
          badge="Finished"
          badgeColor="blue"
        />
        <StatCard
          icon={<Clock size={17} />}
          label="On Hold / Planned"
          value={holdOrPlannedCount.toString()}
          badge="Waiting"
          badgeColor="green"
        />
      </div>

      {/* Search, Filter, Action Bar */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm transition-colors outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/12 sm:flex-none sm:w-60"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm bg-slate-50 focus:bg-white font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-sm font-medium"
        >
          + Create Project
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="notice notice-danger">
          <AlertTriangle size={16} className="mt-px shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Project Grid Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="m-0 text-base font-bold text-slate-900">All Organization Projects ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="skeleton h-11 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Folder size={22} />
            </span>
            <p className="empty-state-title">No projects match the filters</p>
            <p className="empty-state-text">
              Clear the search or change the status filter, or create a new project to get
              started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[800px]">
              <thead>
                <tr>
                  {["Project Name", "Assigned Mentor", "Mentees", "Status", "Dates", "Actions"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td>
                      <span className="block font-semibold text-slate-900 text-sm">{p.title}</span>
                      {p.description && (
                        <span className="block text-xs text-slate-500 mt-1 truncate max-w-[250px]">{p.description}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {p.mentorId?.name || <span className="italic text-slate-400">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {p.mentees && p.mentees.length > 0 ? (
                        <span>{p.mentees.length} assigned</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p._id, e.target.value)}
                        disabled={updatingProjectId === p._id}
                        aria-label={`Status for ${p.title}`}
                        className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors outline-none hover:border-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="PLANNED">Planned</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {p.startDate ? formatUIDate(new Date(p.startDate)) : "—"}
                      {" → "}
                      {p.endDate ? formatUIDate(new Date(p.endDate)) : "—"}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => onViewProject(p._id)}
                        className="text-xs px-3 py-1.5"
                      >
                        View
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(p._id)}
                        className="text-xs px-3 py-1.5"
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

      {/* Creation Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-ink-950/45 backdrop-blur-[2px] animate-fade-in" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal-panel max-w-md flex flex-col gap-6 p-6 sm:p-7" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="m-0 text-xl font-bold text-slate-900">Create New Project</h3>
              <p className="page-subtitle mt-1">Launch a new organizational tracking workspace.</p>
            </div>

            {createError && (
              <div className="notice notice-danger">
          <AlertTriangle size={16} className="mt-px shrink-0" />
          <span>{createError}</span>
        </div>
            )}

            <div className="flex flex-col gap-5">
              <div>
                <label className="field-label">Project Title</label>
                <input
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. AI Chatbot Project"
                  className="input-field"
                  disabled={createLoading}
                />
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Describe project details..."
                  className="input-field resize-none"
                  style={{ minHeight: 80 }}
                  disabled={createLoading}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="field-label">Start Date</label>
                  <input
                    type="date"
                    value={newProjectStartDate}
                    onChange={(e) => setNewProjectStartDate(e.target.value)}
                    className="input-field"
                    disabled={createLoading}
                  />
                </div>
                <div className="flex-1">
                  <label className="field-label">End Date</label>
                  <input
                    type="date"
                    value={newProjectEndDate}
                    onChange={(e) => setNewProjectEndDate(e.target.value)}
                    min={newProjectStartDate}
                    className="input-field"
                    disabled={createLoading}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectTitle("");
                  setNewProjectDesc("");
                  setNewProjectStartDate("");
                  setNewProjectEndDate("");
                  setCreateError(null);
                }}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createLoading}
              >
                {createLoading ? "Creating..." : "Launch Project"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
