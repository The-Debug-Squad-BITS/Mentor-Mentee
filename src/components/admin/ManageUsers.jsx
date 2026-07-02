import { useState, useEffect, useCallback } from "react";
import Avatar from "../ui/Avatar";
import CreateUserModal from "./CreateUserModal";
import api from "../../lib/api";
import { useUserStore } from "../../store/userStore";
import { toast } from "react-toastify";

export default function ManageUsers({ onUserDeleted }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Profile Drawer State
  const [selectedUser, setSelectedUser] = useState(null);

  const { users, pagination, setUsers } = useUserStore();

  // ── Fetch users from backend API ────────────────────────────────────
  const fetchUsers = useCallback(async (role = "", search = "", page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (role && role !== "ALL") params.role = role;
      if (search) params.search = search;
      const response = await api.get("/users", { params });
      const { users: usersList, pagination: paginationData } = response.data.data;
      setUsers(usersList, paginationData);
    } catch (err) {
      setError("Failed to load users. Please try again.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [setUsers]);

  // Load users on mount and when filters change
  useEffect(() => {
    fetchUsers(roleFilter, searchQuery, currentPage);
  }, [roleFilter, currentPage, fetchUsers]);

  // Debounced search — trigger fetch after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(roleFilter, searchQuery, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Deactivate user (soft delete) ───────────────────────────────────
  const handleDeactivate = async (userId, name, e) => {
    e.stopPropagation(); // Avoid triggering profile view
    const confirmed = window.confirm(`Deactivate ${name}? This will revoke their access.`);
    if (!confirmed) return;

    try {
      await api.delete(`/users/${userId}`);
      // Refresh the list after deactivation
      fetchUsers(roleFilter, searchQuery, currentPage);
      if (onUserDeleted) onUserDeleted();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
      toast.success("User deactivated successfully.");
    } catch (err) {
      toast.error("Failed to deactivate user. Please try again.");
      console.error("Error deactivating user:", err);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    // Role change not supported by current API — placeholder for future
  };

  const handleUserCreated = () => {
    fetchUsers(roleFilter, searchQuery, currentPage);
    if (onUserDeleted) onUserDeleted();
  };

  // Get projects assigned to user
  const getUserProjects = (user) => {
    return [];
  };

  // Helper to generate avatar initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  };

  // Helper to generate a consistent color from name
  const getColor = (name) => {
    const colors = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const userProjects = selectedUser ? getUserProjects(selectedUser) : [];

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header & Search */}
      <div
        className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}
      >
        <div>
          <h2 className="m-0 text-base md:text-lg lg:text-xl font-black text-slate-800">
            User Workspace Directories
          </h2>
          <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">
            Manage organization members, review their assigned projects, or change access credentials.
          </p>
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto">
          <input
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none text-xs flex-1 md:w-56 font-sans bg-slate-50"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold border-0 px-4 py-3 rounded-xl cursor-pointer text-xs transition-colors shadow-lg shadow-blue-500/10 shrink-0"
            style={{ fontFamily: "inherit" }}
          >
            + Invite User
          </button>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 flex-wrap bg-white rounded-2xl p-2 border border-slate-100 self-start" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.02)" }}>
        {["ALL", "MENTOR", "MENTEE"].map(role => (
          <button
            key={role}
            onClick={() => {
              setRoleFilter(role);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              roleFilter === role
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-transparent text-slate-500 hover:bg-slate-50"
            }`}
            style={{ fontFamily: "inherit" }}
          >
            {role === "ALL" ? "All Members" : role}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      {/* Main content grid split (List on left, Profile Drawer on right) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Members Table */}
        <div
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden flex-1 w-full"
          style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}
        >
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">No members match the query filters.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-130">
                  <thead>
                    <tr className="bg-slate-50">
                      {["User Name", "Role", "Email", "Status", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        onClick={() => setSelectedUser(u)}
                        className={`border-b border-slate-50 hover:bg-slate-50/40 cursor-pointer transition-colors duration-150 ${
                          selectedUser && selectedUser._id === u._id ? "bg-blue-50/20" : ""
                        }`}
                      >
                        {/* Name + Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={getInitials(u.name)} color={getColor(u.name)} size={32} />
                            <div>
                              <span className="block font-black text-slate-800 text-xs md:text-sm">
                                {u.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase ${
                            u.role === "MENTOR"
                              ? "bg-indigo-50 text-indigo-600"
                              : u.role === "MENTEE"
                              ? "bg-cyan-50 text-cyan-600"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-xs text-slate-400 font-semibold">
                          {u.email}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${
                              u.isActive
                                ? "bg-green-50 text-green-700 border-green-100"
                                : "bg-red-50 text-red-600 border-red-100"
                            }`}
                          >
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          {u.isActive && (
                            <button
                              onClick={(e) => handleDeactivate(u._id, u.name, e)}
                              className="bg-transparent border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 cursor-pointer transition-colors"
                              style={{ fontFamily: "inherit" }}
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      style={{ fontFamily: "inherit" }}
                    >
                      ← Prev
                    </button>
                    <button
                      disabled={currentPage >= pagination.pages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      style={{ fontFamily: "inherit" }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Profile Sidebar Drawer (Renders dynamically when a user is clicked) */}
        {selectedUser && (
          <div
            className="w-full lg:w-80 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-6 shrink-0 relative animate-fade-in"
            style={{ boxShadow: "0 4px 20px rgba(59,130,246,0.06)" }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center cursor-pointer border-none text-sm transition-colors"
            >
              ✕
            </button>

            {/* Profile Large Card */}
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar initials={getInitials(selectedUser.name)} color={getColor(selectedUser.name)} size={64} />
              <div>
                <h3 className="m-0 text-base font-black text-slate-800 leading-tight">{selectedUser.name}</h3>
                <span className="text-slate-400 text-xs font-semibold">{selectedUser.email}</span>
              </div>
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wider ${
                  selectedUser.isActive
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-red-50 text-red-600 border-red-100"
                }`}
              >
                {selectedUser.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <hr className="border-0 border-t border-slate-100 m-0" />

            {/* Role Display */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">System Role</label>
              <span className={`inline-block self-start px-3 py-1.5 rounded-xl text-xs font-bold ${
                selectedUser.role === "MENTOR"
                  ? "bg-indigo-50 text-indigo-600"
                  : selectedUser.role === "MENTEE"
                  ? "bg-cyan-50 text-cyan-600"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {selectedUser.role}
              </span>
            </div>

            {/* Assigned Projects list */}
            <div className="flex flex-col gap-3">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Assigned Projects ({userProjects.length})</label>
              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                {userProjects.length === 0 ? (
                  <div className="text-slate-400 italic text-xs py-2 font-medium">Not assigned to any projects.</div>
                ) : (
                  userProjects.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <span className="font-bold text-slate-700 text-xs truncate max-w-[150px]">{p.name}</span>
                      <span className="text-[10px] font-extrabold text-blue-500 uppercase">{p.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
}
