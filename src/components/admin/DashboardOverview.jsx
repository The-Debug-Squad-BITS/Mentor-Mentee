import { useState, useEffect } from "react";
import StatCard from "../ui/StatCard";
import ProgressBar from "../ui/ProgressBar";
import { db } from "../../data/db";

const statusStyle = {
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Completed: "bg-blue-100 text-blue-700",
  Archived: "bg-slate-100 text-slate-500",
};

export default function DashboardOverview({ projects, logs, onAddProject, apiStats }) {
  const [newProjectName, setNewProjectName] = useState("");
  
  // Quick invite states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MENTEE");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // ── Stats: prefer real API data, fall back to local db ──────────────
  const usersList = db.users.getAll();
  const invitationsList = db.invitations.getAll();

  const totalMentors     = apiStats?.totalMentors     ?? usersList.filter(u => u.role.toUpperCase() === "MENTOR").length;
  const totalMentees     = apiStats?.totalMentees      ?? usersList.filter(u => u.role.toUpperCase() === "MENTEE").length;
  const totalProjects    = apiStats?.totalProjects     ?? projects.filter(p => p.status === "Active").length;
  const pendingInvites   = apiStats?.pendingInvitations ?? invitationsList.filter(inv => inv.status === "PENDING").length;

  const handleAdd = () => {
    if (!newProjectName.trim()) return;
    onAddProject(newProjectName.trim());
    setNewProjectName("");
  };

  const handleQuickInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    db.invitations.create(inviteEmail, inviteRole);
    setInviteEmail("");
    setInviteRole("MENTEE");
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Stat cards */}
      <div className="flex gap-5 flex-wrap">
        <StatCard
          icon="🎓"
          label="Total Mentors"
          value={totalMentors.toString()}
          badge="Mentorship Network"
          badgeColor="green"
        />
        <StatCard
          icon="👥"
          label="Total Mentees"
          value={totalMentees.toString()}
          badge="Active Learners"
          badgeColor="blue"
        />
        <StatCard
          icon="📋"
          label="Total Projects"
          value={totalProjects.toString()}
          badge="Development Logs"
          badgeColor="blue"
        />
        <StatCard
          icon="✉️"
          label="Pending Invitations"
          value={pendingInvites.toString()}
          badge="Requests Queue"
          badgeColor="green"
        />
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column: Active Projects List */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div
            className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-50/20">
              <div>
                <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
                  Active Projects Overview
                </h2>
                <p className="m-0 text-slate-400 text-[11px] font-semibold mt-0.5">Projects currently in development and assigned to members.</p>
              </div>
              <div className="flex gap-2">
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Quick create project..."
                  className="px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs flex-1 sm:flex-none font-sans"
                />
                <button
                  onClick={handleAdd}
                  className="bg-blue-500 text-white border-0 px-4 py-2 rounded-xl cursor-pointer text-xs font-bold hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/10"
                  style={{ fontFamily: "inherit" }}
                >
                  Launch
                </button>
              </div>
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-120">
                <thead>
                  <tr className="bg-slate-50">
                    {["Project Name", "Lead Mentor", "Status", "Progress"].map((h) => (
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
                  {projects.filter(p => p.status !== "Archived").map((p) => (
                    <tr
                       key={p.id}
                       className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-black text-slate-800 text-xs md:text-sm">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-semibold">
                        {p.mentorName || "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${statusStyle[p.status] || statusStyle.Active}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 w-40">
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
          <div
            className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4"
            style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}
          >
            <div>
              <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
                Quick Invite Member
              </h2>
              <p className="m-0 text-slate-400 text-[11px] font-semibold mt-0.5">Issue brand new credentials to joining users.</p>
            </div>
            
            {inviteSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold p-2.5 rounded-xl">
                ✓ Invite dispatched successfully!
              </div>
            )}

            <form onSubmit={handleQuickInvite} className="flex flex-col gap-3">
              <input
                required
                type="email"
                placeholder="User email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 font-sans"
              />
              <div className="flex gap-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white flex-1 font-bold text-slate-600 outline-none"
                  style={{ fontFamily: "inherit" }}
                >
                  <option value="MENTEE">Mentee (Student)</option>
                  <option value="MENTOR">Mentor (Advisor)</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl border-none text-xs cursor-pointer transition-colors shadow-md shadow-blue-500/10"
                  style={{ fontFamily: "inherit" }}
                >
                  Dispatch
                </button>
              </div>
            </form>
          </div>

          {/* Pending Invitations Panel */}
          <div
            className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4"
            style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}
          >
            <div>
              <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
                Pending Invitations ({pendingInvites})
              </h2>
              <p className="m-0 text-slate-400 text-[11px] font-semibold mt-0.5">Invitations waiting for member acceptance.</p>
            </div>
            
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
              {invitationsList.filter(i => i.status === "PENDING").length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs font-semibold">No pending invitations.</div>
              ) : (
                invitationsList.filter(i => i.status === "PENDING").map(inv => (
                  <div key={inv.id} className="flex justify-between items-center bg-slate-50/50 border border-slate-100 rounded-2xl p-3">
                    <div className="min-w-0">
                      <span className="block font-bold text-slate-700 text-xs truncate">{inv.email}</span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">{inv.role}</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase">
                      Pending
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity feed */}
          <div
            className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4"
            style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}
          >
            <div>
              <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
                Recent Operations Feed
              </h2>
              <p className="m-0 text-slate-400 text-[11px] font-semibold mt-0.5">Timeline of system processes and assignments.</p>
            </div>
            
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs font-semibold">No activities logged.</div>
              ) : (
                logs.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex gap-3 items-start border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 bg-blue-50 text-blue-600">
                      ⚡
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-xs text-slate-600 font-semibold leading-relaxed">
                        {act.text}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-bold">
                        {act.time}
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
