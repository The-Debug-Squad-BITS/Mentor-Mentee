import { useState, useEffect } from "react";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import StatCard from "../ui/StatCard";

export default function ProjectsList({ onViewProject, onRefresh }) {
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Name");
  
  // Creation modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectMentor, setNewProjectMentor] = useState("");
  const [newProjectMentees, setNewProjectMentees] = useState([]);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingProjectMentor, setEditingProjectMentor] = useState("");
  const [editingProjectMentees, setEditingProjectMentees] = useState([]);

  const refreshList = () => {
    // Stubbed until integrated with backend API
    setProjects([]);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const mentors = [];
  const mentees = [];

  const handleCreate = () => {
    if (!newProjectName.trim()) return;
    // Stubbed until integrated with backend API
    setNewProjectName("");
    setNewProjectDesc("");
    setNewProjectMentor("");
    setNewProjectMentees([]);
    setShowCreateModal(false);
    refreshList();
    if (onRefresh) onRefresh();
  };

  const handleArchive = (id) => {
    // Stubbed until integrated with backend API
    refreshList();
    if (onRefresh) onRefresh();
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this project? This will remove all members and tasks associated with it!")) {
      // Stubbed until integrated with backend API
      refreshList();
      if (onRefresh) onRefresh();
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingProject.name.trim()) return;
    // Stubbed until integrated with backend API
    setShowEditModal(false);
    setEditingProject(null);
    setEditingProjectMentor("");
    setEditingProjectMentees([]);
    refreshList();
    if (onRefresh) onRefresh();
  };

  // Filter & Sort logic
  const filtered = projects
    .filter(p => statusFilter === "All" || p.status.toUpperCase() === statusFilter.toUpperCase())
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "Name") return a.name.localeCompare(b.name);
      if (sortBy === "Progress (Asc)") return a.progress - b.progress;
      if (sortBy === "Progress (Desc)") return b.progress - a.progress;
      return 0;
    });

  // Calculate project list status summaries
  const totalProjCount = projects.length;
  const activeProjCount = projects.filter(p => p.status === "Active").length;
  const completedProjCount = projects.filter(p => p.status === "Completed").length;
  const holdOrArchivedCount = projects.filter(p => p.status === "On Hold" || p.status === "Archived").length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Projects summary stats */}
      <div className="flex gap-5 flex-wrap">
        <StatCard
          icon="📁"
          label="Total Workspaces"
          value={totalProjCount.toString()}
          badge="Global Catalog"
          badgeColor="blue"
        />
        <StatCard
          icon="🚀"
          label="Active Tracks"
          value={activeProjCount.toString()}
          badge="In Development"
          badgeColor="green"
        />
        <StatCard
          icon="✅"
          label="Completed"
          value={completedProjCount.toString()}
          badge="Archived Success"
          badgeColor="blue"
        />
        <StatCard
          icon="⏸️"
          label="On Hold / Archived"
          value={holdOrArchivedCount.toString()}
          badge="Paused tracks"
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
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold text-slate-600 outline-none"
            style={{ fontFamily: "inherit" }}
          >
            <option value="Name">Name (A-Z)</option>
            <option value="Progress (Asc)">Progress (Asc)</option>
            <option value="Progress (Desc)">Progress (Desc)</option>
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

      {/* Project Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
          <h2 className="m-0 text-sm md:text-base font-extrabold text-slate-800">All Organization Projects ({filtered.length})</h2>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">No projects match the filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-150">
              <thead>
                <tr className="bg-slate-50">
                  {["Project Name", "Assigned Mentor", "Mentees", "Status", "Progress", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-800 text-xs md:text-sm lg:text-base">{p.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-semibold">{p.mentorName || "Unassigned"}</td>
                    {/* Assigned or Unassigned for mentees */}
                    <td className="px-6 py-4 text-xs text-slate-500 font-semibold">
                      {p.mentees && p.mentees.length > 0 ? (
                        <span>Assigned</span>
                      ) : (
                        <span className="text-slate-400 italic font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 w-40"><ProgressBar value={p.progress} /></td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => onViewProject(p.id)}
                        className="bg-transparent border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 cursor-pointer transition-colors"
                        style={{ fontFamily: "inherit" }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditingProject(p);
                          setEditingProjectMentor(p.mentor ? p.mentor.id : "");
                          setEditingProjectMentees(p.mentees ? p.mentees.map(st => st.id) : []);
                          setShowEditModal(true);
                        }}
                        className="bg-transparent border border-slate-200 hover:border-blue-400 hover:text-blue-500 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 cursor-pointer transition-colors"
                        style={{ fontFamily: "inherit" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(p.id)}
                        disabled={p.status === "Archived" || p.status === "Completed"}
                        className="bg-transparent border border-amber-200 hover:border-amber-400 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-600 cursor-pointer transition-colors"
                        style={{ fontFamily: "inherit" }}
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
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
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Project Name</label>
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Android Interface Rewrite"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 font-sans"
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
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Assign Lead Mentor</label>
                <select
                  value={newProjectMentor}
                  onChange={(e) => setNewProjectMentor(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 bg-white"
                  style={{ fontFamily: "inherit" }}
                >
                  <option value="">-- Unassigned --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Assign Team Mentees</label>
                <div className="border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto flex flex-col gap-2 bg-slate-50">
                  {mentees.map(st => {
                    const isChecked = newProjectMentees.includes(st.id);
                    return (
                      <label key={st.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/50 p-1.5 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setNewProjectMentees(newProjectMentees.filter(id => id !== st.id));
                            } else {
                              setNewProjectMentees([...newProjectMentees, st.id]);
                            }
                          }}
                          className="rounded text-blue-500 focus:ring-blue-400"
                        />
                        <span className="text-xs font-bold text-slate-700">{st.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectName("");
                  setNewProjectDesc("");
                  setNewProjectMentor("");
                  setNewProjectMentees([]);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-3 rounded-xl border-none bg-blue-500 hover:bg-blue-600 text-xs font-bold text-white cursor-pointer transition-colors"
                style={{ fontFamily: "inherit", boxShadow: "0 4px 12px rgba(59,130,246,0.25)" }}
              >
                Launch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Overlay */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 flex items-center justify-center z-250 p-4" style={{ background: "rgba(15,23,42,0.5)" }} onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}>
          <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col gap-5" style={{ boxShadow: "0 24px 80px rgba(59,130,246,0.15)" }}>
            <div>
              <h3 className="m-0 text-lg font-black text-slate-800">Edit Project Settings</h3>
              <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Modify name, description, and status values.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Project Name</label>
                <input
                  required
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 font-sans"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  value={editingProject.description || ""}
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 resize-none font-sans"
                  style={{ minHeight: 70 }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Status</label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({...editingProject, status: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 bg-white"
                  style={{ fontFamily: "inherit" }}
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Modify Lead Mentor</label>
                <select
                  value={editingProjectMentor}
                  onChange={(e) => setEditingProjectMentor(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 bg-white"
                  style={{ fontFamily: "inherit" }}
                >
                  <option value="">-- Unassigned --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Modify Team Mentees</label>
                <div className="border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto flex flex-col gap-2 bg-slate-50">
                  {mentees.map(st => {
                    const isChecked = editingProjectMentees.includes(st.id);
                    return (
                      <label key={st.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/50 p-1.5 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setEditingProjectMentees(editingProjectMentees.filter(id => id !== st.id));
                            } else {
                              setEditingProjectMentees([...editingProjectMentees, st.id]);
                            }
                          }}
                          className="rounded text-blue-500 focus:ring-blue-400"
                        />
                        <span className="text-xs font-bold text-slate-700">{st.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProject(null);
                  setEditingProjectMentor("");
                  setEditingProjectMentees([]);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl border-none bg-blue-500 hover:bg-blue-600 text-xs font-bold text-white cursor-pointer transition-colors"
                style={{ fontFamily: "inherit", boxShadow: "0 4px 12px rgba(59,130,246,0.25)" }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
