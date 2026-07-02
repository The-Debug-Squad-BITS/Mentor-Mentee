import { useState, useEffect, useCallback } from "react";
import StatusBadge from "../ui/StatusBadge";
import StatCard from "../ui/StatCard";
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
      <div className="flex gap-5 flex-wrap">
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
      <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        <div className="flex gap-3 flex-wrap items-center">
          <input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 bg-slate-50 font-sans"
            style={{ minWidth: 200 }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold text-slate-600 outline-none"
            style={{ fontFamily: "inherit" }}
          >
            <option value="All">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-3 rounded-xl border-none text-xs cursor-pointer transition-colors shadow-lg shadow-blue-500/20"
          style={{ fontFamily: "inherit" }}
        >
          + Create Project
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      {/* Project Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
          <h2 className="m-0 text-sm md:text-base font-extrabold text-slate-800">All Organization Projects ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">No projects match the filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-150">
              <thead>
                <tr className="bg-slate-50">
                  {["Project Name", "Assigned Mentor", "Mentees", "Status", "Dates", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="block font-black text-slate-800 text-xs md:text-sm lg:text-base">{p.title}</span>
                      {p.description && (
                        <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{p.description}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-semibold">
                      {p.mentorId?.name || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-semibold">
                      {p.mentees && p.mentees.length > 0 ? (
                        <span>{p.mentees.length} assigned</span>
                      ) : (
                        <span className="text-slate-400 italic font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-[10px] text-slate-400 font-semibold">
                      {p.startDate ? new Date(p.startDate).toLocaleDateString() : "—"}
                      {" → "}
                      {p.endDate ? new Date(p.endDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => onViewProject(p._id)}
                        className="bg-transparent border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 cursor-pointer transition-colors"
                        style={{ fontFamily: "inherit" }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="bg-transparent border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 cursor-pointer transition-colors"
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

      {/* Creation Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-250 p-4" style={{ background: "rgba(15,23,42,0.5)" }} onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col gap-5" style={{ boxShadow: "0 24px 80px rgba(59,130,246,0.15)" }}>
            <div>
              <h3 className="m-0 text-lg font-black text-slate-800">Create New Project</h3>
              <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Launch a new organizational tracking workspace.</p>
            </div>

            {createError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-semibold">
                ⚠️ {createError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Project Title</label>
                <input
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. AI Chatbot Project"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 font-sans"
                  disabled={createLoading}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Describe project details..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 resize-none font-sans"
                  style={{ minHeight: 65 }}
                  disabled={createLoading}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Start Date</label>
                  <input
                    type="date"
                    value={newProjectStartDate}
                    onChange={(e) => setNewProjectStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 font-sans"
                    disabled={createLoading}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">End Date</label>
                  <input
                    type="date"
                    value={newProjectEndDate}
                    onChange={(e) => setNewProjectEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 font-sans"
                    disabled={createLoading}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectTitle("");
                  setNewProjectDesc("");
                  setNewProjectStartDate("");
                  setNewProjectEndDate("");
                  setCreateError(null);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ fontFamily: "inherit" }}
                disabled={createLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading}
                className="flex-1 py-3 rounded-xl border-none bg-blue-500 hover:bg-blue-600 text-xs font-bold text-white cursor-pointer transition-colors disabled:opacity-60"
                style={{ fontFamily: "inherit", boxShadow: "0 4px 12px rgba(59,130,246,0.25)" }}
              >
                {createLoading ? "Creating..." : "Launch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
