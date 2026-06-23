import { useState } from "react";
import Avatar from "../ui/Avatar";
import CreateUserModal from "./CreateUserModal";

export default function ManageUsers({ onUserDeleted }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Profile Drawer State
  const [selectedUser, setSelectedUser] = useState(null);

  const refreshUsersList = () => {
    // Stubbed until integrated with backend API
    setUsers([]);
    setSelectedUser(null);
  };

  const handleDelete = (id, name, e) => {
    e.stopPropagation(); // Avoid triggering profile view
    if (confirm(`Are you sure you want to delete ${name}? This will revoke their access and clear memberships.`)) {
      // Stubbed until integrated with backend API
      refreshUsersList();
      if (onUserDeleted) onUserDeleted();
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser(null);
      }
    }
  };

  const handleRoleChange = (userId, newRole) => {
    // Stubbed until integrated with backend API
    refreshUsersList();
  };

  const handleUserCreated = () => {
    refreshUsersList();
    if (onUserDeleted) onUserDeleted();
  };

  // Get projects assigned to user
  const getUserProjects = (user) => {
    return [];
  };

  // Filter logic
  const filtered = users
    .filter((u) => roleFilter === "ALL" || u.role.toUpperCase() === roleFilter.toUpperCase())
    .filter((u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            + Add User
          </button>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 flex-wrap bg-white rounded-2xl p-2 border border-slate-100 self-start" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.02)" }}>
        {["ALL", "ADMIN", "MENTOR", "MENTEE"].map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
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

      {/* Main content grid split (List on left, Profile Drawer on right) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Members Table */}
        <div
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden flex-1 w-full"
          style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}
        >
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">No members match the query filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-130">
                <thead>
                  <tr className="bg-slate-50">
                    {["User Name", "Role", "Joined Date", "Status", "Actions"].map((h) => (
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
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`border-b border-slate-50 hover:bg-slate-50/40 cursor-pointer transition-colors duration-150 ${
                        selectedUser && selectedUser.id === u.id ? "bg-blue-50/20" : ""
                      }`}
                    >
                      {/* Name + Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar initials={u.avatar} color={u.color} size={32} />
                          <div>
                            <span className="block font-black text-slate-800 text-xs md:text-sm">
                              {u.name}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600 font-bold text-[10px] uppercase">
                          {u.role}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-xs text-slate-400 font-semibold">
                        {u.joined}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${
                            u.status === "Active"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-red-50 text-red-600 border-red-100"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => handleDelete(u.id, u.name, e)}
                          className="bg-transparent border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 cursor-pointer transition-colors"
                          style={{ fontFamily: "inherit" }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              <Avatar initials={selectedUser.avatar} color={selectedUser.color} size={64} />
              <div>
                <h3 className="m-0 text-base font-black text-slate-800 leading-tight">{selectedUser.name}</h3>
                <span className="text-slate-400 text-xs font-semibold">{selectedUser.email}</span>
              </div>
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wider ${
                  selectedUser.status === "Active"
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-red-50 text-red-600 border-red-100"
                }`}
              >
                {selectedUser.status}
              </span>
            </div>

            <hr className="border-0 border-t border-slate-100 m-0" />

            {/* Role Modifier */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Assign System Role</label>
              <select
                value={selectedUser.role}
                onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-slate-50 outline-none focus:border-blue-400"
                style={{ fontFamily: "inherit" }}
              >
                <option value="ADMIN">ADMINISTRATOR</option>
                <option value="MENTOR">MENTOR (ADVISOR)</option>
                <option value="MENTEE">MENTEE (STUDENT)</option>
              </select>
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
