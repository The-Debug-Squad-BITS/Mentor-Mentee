import { useState, useEffect, useCallback } from "react";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
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
    <div className="flex flex-col gap-6 relative animate-fade-in">
      {/* Header & Search */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="m-0 text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            User Workspace Directories
          </h2>
          <p className="m-0 mt-1 text-slate-500 text-sm">
            Manage organization members, review their assigned projects, or change access credentials.
          </p>
        </div>
        <div className="flex gap-3 items-center w-full md:w-auto">
          <input
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 outline-none text-sm flex-1 md:w-64 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <Button
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 text-sm font-medium px-4 py-2"
          >
            + Invite User
          </Button>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 flex-wrap bg-white rounded-lg p-1.5 border border-slate-200 self-start shadow-sm">
        {["ALL", "MENTOR", "MENTEE"].map(role => (
          <button
            key={role}
            onClick={() => {
              setRoleFilter(role);
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              roleFilter === role
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {role === "ALL" ? "All Members" : role}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      {/* Main content grid split (List on left, Profile Drawer on right) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Members Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 w-full shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No members match the query filters.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["User Name", "Role", "Email", "Status", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        onClick={() => setSelectedUser(u)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors duration-150 ${
                          selectedUser && selectedUser._id === u._id ? "bg-blue-50/50" : ""
                        }`}
                      >
                        {/* Name + Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={getInitials(u.name)} color={getColor(u.name)} size={32} />
                            <div>
                              <span className="block font-semibold text-slate-900 text-sm">
                                {u.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md font-medium text-xs ${
                            u.role === "MENTOR"
                              ? "bg-indigo-50 text-indigo-700"
                              : u.role === "MENTEE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {u.email}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={u.isActive ? "Active" : "Inactive"} />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          {u.isActive && (
                            <Button
                              variant="danger"
                              onClick={(e) => handleDeactivate(u._id, u.name, e)}
                              className="text-xs px-3 py-1.5"
                            >
                              Deactivate
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                  <span className="text-sm text-slate-500">
                    Page <span className="font-medium text-slate-900">{pagination.page}</span> of <span className="font-medium text-slate-900">{pagination.pages}</span>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="text-xs px-3 py-1.5"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={currentPage >= pagination.pages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="text-xs px-3 py-1.5"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Profile Sidebar Drawer */}
        {selectedUser && (
          <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 shrink-0 relative shadow-md animate-fade-in">
            {/* Close button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            >
              ✕
            </button>

            {/* Profile Large Card */}
            <div className="flex flex-col items-center text-center gap-4 mt-2">
              <Avatar initials={getInitials(selectedUser.name)} color={getColor(selectedUser.name)} size={72} />
              <div>
                <h3 className="m-0 text-lg font-bold text-slate-900">{selectedUser.name}</h3>
                <span className="text-slate-500 text-sm">{selectedUser.email}</span>
              </div>
              <StatusBadge status={selectedUser.isActive ? "Active" : "Inactive"} />
            </div>

            <hr className="border-0 border-t border-slate-200 m-0" />

            {/* Role Display */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">System Role</label>
              <span className={`inline-block self-start px-3 py-1 rounded-md text-sm font-medium ${
                selectedUser.role === "MENTOR"
                  ? "bg-indigo-50 text-indigo-700"
                  : selectedUser.role === "MENTEE"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {selectedUser.role}
              </span>
            </div>

            {/* Assigned Projects list */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Projects ({userProjects.length})</label>
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                {userProjects.length === 0 ? (
                  <div className="text-slate-500 text-sm py-2 bg-slate-50 rounded-lg text-center border border-slate-100">Not assigned to any projects.</div>
                ) : (
                  userProjects.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="font-medium text-slate-900 text-sm truncate">{p.name}</span>
                      <StatusBadge status={p.status} />
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
