import { useState, useEffect } from "react";
import StatCard from "../ui/StatCard";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import api from "../../lib/api";
import { formatActivityLine } from "./ActivityLogs";

export default function DashboardOverview({ projects, logs, onAddProject, apiStats }) {
  const [newProjectName, setNewProjectName] = useState("");
  
  // Quick invite states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MENTEE");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // ── Stats: prefer real API data, fall back to 0 ──────────────
  const invitationsList = [];

  const totalMentors     = apiStats?.totalMentors     ?? 0;
  const totalMentees     = apiStats?.totalMentees      ?? 0;
  const totalProjects    = apiStats?.totalProjects     ?? 0;
  const pendingInvites   = apiStats?.pendingInvitations ?? 0;

  const handleAdd = () => {
    if (!newProjectName.trim()) return;
    onAddProject(newProjectName.trim());
    setNewProjectName("");
  };

  const [inviteError, setInviteError] = useState("");

  const handleQuickInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteError("");
    try {
      // Use email username as a default name for the quick invite flow
      const defaultName = inviteEmail.split("@")[0].replace(/[._-]/g, " ");
      await api.post("/users/invite", {
        name: defaultName,
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteRole("MENTEE");
      setInviteSuccess(true);
      setTimeout(() => {
        setInviteSuccess(false);
      }, 3000);
    } catch (err) {
      if (err.response?.status === 409) {
        setInviteError("This email is already registered.");
      } else if (err.response?.status === 400) {
        setInviteError(err.response.data?.message || "Validation error.");
      } else {
        setInviteError("Failed to send invite. Please try again.");
      }
      setTimeout(() => setInviteError(""), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Stat cards */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon="🎓"
          label="Total Mentors"
          value={totalMentors.toString()}
          badge="Network"
          badgeColor="green"
        />
        <StatCard
          icon="👥"
          label="Total Mentees"
          value={totalMentees.toString()}
          badge="Learners"
          badgeColor="blue"
        />
        <StatCard
          icon="📋"
          label="Total Projects"
          value={totalProjects.toString()}
          badge="Active"
          badgeColor="blue"
        />
        <StatCard
          icon="✉️"
          label="Pending Invites"
          value={pendingInvites.toString()}
          badge="Queue"
          badgeColor="green"
        />
        <StatCard
          icon="🏁"
          label="Total Milestones"
          value={(apiStats?.totalMilestones ?? 0).toString()}
          badge="Checkpoints"
          badgeColor="purple"
        />
        <StatCard
          icon="📈"
          label="Milestone Completion"
          value={`${apiStats?.milestoneCompletionRate ?? 0}%`}
          badge="Progress"
          badgeColor="emerald"
        />
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column: Active Projects List */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50">
              <div>
                <h2 className="m-0 text-base font-bold text-slate-900">
                  Active Projects Overview
                </h2>
                <p className="m-0 text-slate-500 text-sm mt-1">Projects currently in development.</p>
              </div>
              <div className="flex gap-2">
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Project name..."
                  className="px-3 py-2 rounded-lg border border-slate-300 outline-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all flex-1 sm:w-48"
                />
                <Button onClick={handleAdd}>Create</Button>
              </div>
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px] text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {["Project Name", "Lead Mentor", "Status", "Progress"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {projects.filter(p => p.status !== "Archived").map((p) => (
                    <tr
                       key={p.id}
                       className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {p.mentorName || "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 w-48">
                        <ProgressBar value={p.progress} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Side Actions & Feeds */}
        <div className="flex flex-col gap-6">
          {/* Quick Invite Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="m-0 text-base font-bold text-slate-900">
                Quick Invite Member
              </h2>
              <p className="m-0 text-slate-500 text-sm mt-1">Issue credentials to joining users.</p>
            </div>
            
            {inviteSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium p-3 rounded-lg mb-4">
                ✓ Invite dispatched successfully!
              </div>
            )}

            {inviteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-lg mb-4">
                ⚠️ {inviteError}
              </div>
            )}

            <form onSubmit={handleQuickInvite} className="flex flex-col gap-3">
              <input
                required
                type="email"
                placeholder="User email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <div className="flex gap-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white flex-1 font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  <option value="MENTEE">Mentee</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <Button type="submit">Invite</Button>
              </div>
            </form>
          </div>

          {/* Pending Invitations Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="m-0 text-base font-bold text-slate-900">
                Pending Invitations <span className="text-slate-400 font-normal">({pendingInvites})</span>
              </h2>
            </div>
            
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto">
              {invitationsList.filter(i => i.status === "PENDING").length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">No pending invitations.</div>
              ) : (
                invitationsList.filter(i => i.status === "PENDING").map(inv => (
                  <div key={inv.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="min-w-0">
                      <span className="block font-semibold text-slate-900 text-sm truncate">{inv.email}</span>
                      <span className="block text-xs text-slate-500 uppercase tracking-wide mt-0.5">{inv.role}</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full uppercase">
                      Pending
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="m-0 text-base font-bold text-slate-900">
                Recent Operations Feed
              </h2>
            </div>
            
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              {!apiStats?.recentActivities || apiStats.recentActivities.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">No activities logged.</div>
              ) : (
                apiStats.recentActivities.map((act, idx) => (
                  <div key={act._id || idx} className="flex gap-4 items-start border-b border-slate-100 py-3 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100 text-slate-600 border border-slate-200 text-sm">
                      {act.action?.includes("PROJECT") ? "🗂️" :
                       act.action?.includes("TASK") ? "✅" :
                       act.action?.includes("SUBMISSION") ? "📤" :
                       act.action?.includes("MILESTONE") ? "🏁" :
                       act.action?.includes("COMMENT") ? "💬" :
                       act.action?.includes("TEMPLATE") ? "📋" :
                       act.action?.includes("USER") ? "👤" : "⚡"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-sm text-slate-800 leading-snug">
                        {formatActivityLine(act)}
                      </p>
                      <span className="text-xs text-slate-500 mt-1 block font-medium">
                        {new Date(act.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
