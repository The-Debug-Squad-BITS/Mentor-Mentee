import { useState, useEffect, useCallback } from "react";
import StatusBadge from "../ui/StatusBadge";
import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import api from "../../lib/api";
import { useProjectStore } from "../../store/projectStore";
import { toast } from "react-toastify";

export default function ProjectsList({ onViewProject, onRefresh }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
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
          icon="📁"
          label="Total Projects"
          value={totalProjCount.toString()}
          badge="Global Catalog"
          badgeColor="blue"
        />
        <StatCard
          icon="🚀"
          label="Active"
          value={activeProjCount.toString()}
          badge="In Development"
          badgeColor="green"
        />
        <StatCard
          icon="✅"
          label="Completed"
          value={completedProjCount.toString()}
          badge="Finished"
          badgeColor="blue"
        />
        <StatCard
          icon="⏸️"
          label="On Hold / Planned"
          value={holdOrPlannedCount.toString()}
          badge="Waiting"
          badgeColor="green"
        />
      </div>

      {/* Search, Filter, Action Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex gap-3 flex-wrap items-center">
          <input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
            style={{ minWidth: 240 }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm bg-slate-50 focus:bg-white font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      {/* Project Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="m-0 text-base font-bold text-slate-900">All Organization Projects ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm font-medium">Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm font-medium">No projects match the filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50">
                  {["Project Name", "Assigned Mentor", "Mentees", "Status", "Dates", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p._id, e.target.value)}
                        disabled={updatingProjectId === p._id}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors shadow-sm"
                      >
                        <option value="PLANNED">Planned</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {p.startDate ? new Date(p.startDate).toLocaleDateString() : "—"}
                      {" → "}
                      {p.endDate ? new Date(p.endDate).toLocaleDateString() : "—"}
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
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="bg-white rounded-xl p-8 w-full max-w-md flex flex-col gap-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="m-0 text-xl font-bold text-slate-900">Create New Project</h3>
              <p className="m-0 mt-1 text-slate-500 text-sm">Launch a new organizational tracking workspace.</p>
            </div>

            {createError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                ⚠️ {createError}
              </div>
            )}

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Project Title</label>
                <input
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. AI Chatbot Project"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  disabled={createLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Describe project details..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  style={{ minHeight: 80 }}
                  disabled={createLoading}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newProjectStartDate}
                    onChange={(e) => setNewProjectStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    disabled={createLoading}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newProjectEndDate}
                    onChange={(e) => setNewProjectEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
