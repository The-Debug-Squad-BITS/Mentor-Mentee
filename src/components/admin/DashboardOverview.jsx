import { useState, useEffect } from "react";
import StatCard from "../ui/StatCard";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import api from "../../lib/api";
import { formatActivityLine } from "./ActivityLogs";

export default function DashboardOverview({ projects, logs, onAddProject, apiStats, onNavigate }) {
  // Project creation modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectStartDate, setNewProjectStartDate] = useState("");
  const [newProjectEndDate, setNewProjectEndDate] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const handleCreateProject = async () => {
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
      setCreateError(null);
      setShowCreateModal(false);
      
      // Refresh dashboard list
      if (onAddProject) onAddProject();
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
        <StatCard
          icon="💬"
          label="Active Chat Rooms"
          value={(apiStats?.activeChatRooms ?? 0).toString()}
          badge="Chats"
          badgeColor="indigo"
          onClick={onNavigate ? () => onNavigate("Messages") : undefined}
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
                  Projects Overview
                </h2>
                <p className="m-0 text-slate-500 text-sm mt-1">Overview of organizational project tracks.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowCreateModal(true)}>+ Create Project</Button>
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
                  {projects.filter(p => p.status?.toUpperCase() !== "ARCHIVED").map((p) => (
                    <tr
                       key={p._id}
                       className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {p.title}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {p.mentorId?.name || "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 w-48">
                        <ProgressBar value={p.progress || 0} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <UpcomingMeetingsWidget meetings={apiStats?.upcomingMeetings} onNavigate={onNavigate} />
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
                onClick={handleCreateProject}
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

function UpcomingMeetingsWidget({ meetings = [], onNavigate }) {
  const formatWhen = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    if (sameDay) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow, ${time}`;
    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${time}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5 mt-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h2 className="m-0 text-base font-bold text-slate-900 flex items-center gap-2">
            <span>📅</span> Upcoming Meetings
          </h2>
          <p className="m-0 text-slate-500 text-xs mt-1">Scheduled video and audio syncs.</p>
        </div>
        {onNavigate && (
          <Button
            variant="ghost"
            onClick={() => onNavigate("Meetings")}
            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 px-2.5 py-1.5 rounded-lg border border-transparent font-semibold transition-all"
          >
            View All
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {!meetings || meetings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-lg border border-slate-200">
            No upcoming meetings scheduled.
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-xl gap-3 transition-colors"
            >
              <div className="flex gap-3 items-start min-w-0">
                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-blue-50 text-blue-600 font-semibold text-sm border border-blue-100 shadow-sm">
                  {meeting.type === "AUDIO" ? "🎙️" : "🎥"}
                </div>
                <div className="min-w-0">
                  <h3 className="m-0 text-sm font-bold text-slate-900 truncate">
                    {meeting.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">{formatWhen(meeting.scheduledAt)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{meeting.duration || 30} mins</span>
                    <span className="text-slate-300">•</span>
                    <span className="truncate">Host: {meeting.hostId?.name || "Unknown"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {meeting.meetingLink ? (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all no-underline inline-flex items-center gap-1"
                  >
                    <span>Join</span> ↗
                  </a>
                ) : (
                  <span className="px-2.5 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg">
                    No Link
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
