import { useState, useEffect } from "react";
import StatCard from "../ui/StatCard";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import { Icon } from "../ui/Icons";
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

  // Presentational slices of exactly the data the table / list already rendered.
  // Case-insensitive so an "ARCHIVED" status from the API is filtered too.
  const visibleProjects = projects.filter(p => p.status?.toUpperCase() !== "ARCHIVED");
  const pendingInvitations = invitationsList.filter(i => i.status === "PENDING");

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Dynamic Stat cards */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon={<Icon.GraduationCap size={18} />}
          label="Total Mentors"
          value={totalMentors.toString()}
          badge="Network"
          badgeColor="green"
        />
        <StatCard
          icon={<Icon.Users size={18} />}
          label="Total Mentees"
          value={totalMentees.toString()}
          badge="Learners"
          badgeColor="blue"
        />
        <StatCard
          icon={<Icon.Folder size={18} />}
          label="Total Projects"
          value={totalProjects.toString()}
          badge="Active"
          badgeColor="blue"
        />
        <StatCard
          icon={<Icon.Mail size={18} />}
          label="Pending Invites"
          value={pendingInvites.toString()}
          badge="Queue"
          badgeColor="green"
        />
        <StatCard
          icon={<Icon.Flag size={18} />}
          label="Total Milestones"
          value={(apiStats?.totalMilestones ?? 0).toString()}
          badge="Checkpoints"
          badgeColor="purple"
        />
        <StatCard
          icon={<Icon.BarChart size={18} />}
          label="Milestone Completion"
          value={`${apiStats?.milestoneCompletionRate ?? 0}%`}
          badge="Progress"
          badgeColor="green"
        />
        <StatCard
          icon={<Icon.MessageSquare size={18} />}
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
          <section className="card overflow-hidden">
            <div className="card-header">
              <div>
                <h2 className="section-title m-0">Projects overview</h2>
                <p className="m-0 mt-0.5 text-[13px] text-slate-500">
                  Every project track across the organisation.
                </p>
              </div>
              <Button onClick={() => setShowCreateModal(true)} className="shrink-0">
                <Icon.Plus size={16} />
                Create project
              </Button>
            </div>

            {visibleProjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Icon.Folder size={22} />
                </div>
                <p className="empty-state-title">No projects yet</p>
                <p className="empty-state-text">
                  Create the first project to start tracking milestones, tasks and reviews.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table min-w-[600px]">
                  <thead>
                    <tr>
                      {["Project Name", "Lead Mentor", "Status", "Progress"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProjects.map((p) => (
                      <tr key={p._id}>
                        <td className="font-semibold text-slate-900">{p.title}</td>
                        <td className="text-slate-600">{p.mentorId?.name || "Unassigned"}</td>
                        <td>
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="w-48">
                          <ProgressBar value={p.progress || 0} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <UpcomingMeetingsWidget meetings={apiStats?.upcomingMeetings} onNavigate={onNavigate} />
        </div>

        {/* Right Column: Side Actions & Feeds */}
        <div className="flex flex-col gap-6">
          {/* Quick Invite Form */}
          <section className="card">
            <div className="card-header">
              <div>
                <h2 className="section-title m-0">Invite a member</h2>
                <p className="m-0 mt-0.5 text-[13px] text-slate-500">
                  Send workspace access to a mentor, mentee or admin.
                </p>
              </div>
            </div>

            <div className="card-body flex flex-col gap-4">
              {inviteSuccess && (
                <div className="notice notice-success">
                  <Icon.CheckCircle size={16} />
                  <span>Invite dispatched successfully!</span>
                </div>
              )}

              {inviteError && (
                <div className="notice notice-danger">
                  <Icon.AlertTriangle size={16} />
                  <span>{inviteError}</span>
                </div>
              )}

              <form onSubmit={handleQuickInvite} className="flex flex-col gap-4">
                <div>
                  <label className="field-label" htmlFor="quick-invite-email">Email address</label>
                  <input
                    id="quick-invite-email"
                    required
                    type="email"
                    placeholder="name@institution.edu"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="quick-invite-role">Role</label>
                  <div className="flex gap-2">
                    <select
                      id="quick-invite-role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="select-field flex-1"
                    >
                      <option value="MENTEE">Mentee</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <Button type="submit" className="shrink-0">
                      <Icon.Send size={16} />
                      Invite
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </section>

          {/* Pending Invitations Panel */}
          <section className="card">
            <div className="card-header">
              <h2 className="section-title m-0">Pending invitations</h2>
              <span className="badge badge-neutral">{pendingInvites}</span>
            </div>

            <div className="card-body">
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto">
                {pendingInvitations.length === 0 ? (
                  <div className="empty-state py-8">
                    <div className="empty-state-icon">
                      <Icon.Inbox size={22} />
                    </div>
                    <p className="empty-state-title">Nothing awaiting acceptance</p>
                    <p className="empty-state-text">
                      Invites you send are listed here until the recipient joins.
                    </p>
                  </div>
                ) : (
                  pendingInvitations.map(inv => (
                    <div key={inv.id} className="flex justify-between items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                      <div className="min-w-0">
                        <span className="block font-semibold text-slate-900 text-sm truncate">{inv.email}</span>
                        <span className="block text-xs text-slate-500 uppercase tracking-wide mt-0.5">{inv.role}</span>
                      </div>
                      <span className="badge badge-info shrink-0">
                        <span className="badge-dot" aria-hidden="true" />
                        Pending
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Activity feed */}
          <section className="card">
            <div className="card-header">
              <h2 className="section-title m-0">Recent activity</h2>
              <span className="text-slate-400" aria-hidden="true">
                <Icon.Activity size={16} />
              </span>
            </div>

            <div className="card-body">
              <div className="flex flex-col max-h-[300px] overflow-y-auto">
                {!apiStats?.recentActivities || apiStats.recentActivities.length === 0 ? (
                  <div className="empty-state py-8">
                    <div className="empty-state-icon">
                      <Icon.Activity size={22} />
                    </div>
                    <p className="empty-state-title">No activity yet</p>
                    <p className="empty-state-text">
                      Project, task and milestone events across the workspace appear here.
                    </p>
                  </div>
                ) : (
                  apiStats.recentActivities.map((act, idx) => (
                    <div key={act._id || idx} className="flex gap-3.5 items-start border-b border-slate-100 py-3 first:pt-0 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 text-slate-500 border border-slate-200">
                        {act.action?.includes("PROJECT") ? <Icon.Folder size={15} /> :
                         act.action?.includes("TASK") ? <Icon.CheckCircle size={15} /> :
                         act.action?.includes("SUBMISSION") ? <Icon.Upload size={15} /> :
                         act.action?.includes("MILESTONE") ? <Icon.Flag size={15} /> :
                         act.action?.includes("COMMENT") ? <Icon.MessageSquare size={15} /> :
                         act.action?.includes("TEMPLATE") ? <Icon.FileText size={15} /> :
                         act.action?.includes("USER") ? <Icon.User size={15} /> : <Icon.Activity size={15} />}
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
          </section>
        </div>
      </div>

      {/* Creation Modal Overlay */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal-panel max-w-md flex flex-col gap-6 p-6 sm:p-7" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="m-0 font-display text-[17px] font-bold tracking-tight text-slate-900">Create project</h3>
              <p className="m-0 mt-1 text-[13px] text-slate-500">Set up a new project workspace for a supervisor and team.</p>
            </div>

            {createError && (
              <div className="notice notice-danger" role="alert">
                <Icon.AlertTriangle size={16} className="mt-px shrink-0" />
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
                  className="textarea-field min-h-20 resize-none"
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
            
            <div className="modal-footer">
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
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title m-0">Upcoming meetings</h2>
          <p className="m-0 mt-0.5 text-[13px] text-slate-500">Scheduled video and audio syncs.</p>
        </div>
        {onNavigate && (
          <Button variant="ghost" size="sm" onClick={() => onNavigate("Meetings")}>
            View all
            <Icon.ArrowRight size={14} />
          </Button>
        )}
      </div>

      <div className="card-body">
        <div className="flex flex-col gap-3">
          {!meetings || meetings.length === 0 ? (
            <div className="empty-state py-10">
              <div className="empty-state-icon">
                <Icon.Calendar size={22} />
              </div>
              <p className="empty-state-title">No meetings scheduled</p>
              <p className="empty-state-text">
                Sessions booked by mentors and mentees appear here with their join links.
              </p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl gap-3 transition-colors"
              >
                <div className="flex gap-3 items-start min-w-0">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-brand-50 text-brand-600 border border-brand-100">
                    {meeting.type === "AUDIO" ? <Icon.Users size={18} /> : <Icon.Video size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="m-0 text-sm font-bold text-slate-900 truncate">
                      {meeting.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-700">{formatWhen(meeting.scheduledAt)}</span>
                      <span className="text-slate-300" aria-hidden="true">•</span>
                      <span>{meeting.duration || 30} mins</span>
                      <span className="text-slate-300" aria-hidden="true">•</span>
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
                      className="px-3 py-1.5 text-[13px] font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors no-underline inline-flex items-center gap-1.5"
                    >
                      Join
                      <Icon.ArrowUpRight size={14} />
                    </a>
                  ) : (
                    <span className="badge badge-neutral">No link</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
