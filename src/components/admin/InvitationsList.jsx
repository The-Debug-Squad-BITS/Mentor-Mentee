import { useState, useEffect } from "react";
import Button from "../ui/Button";

export default function InvitationsList() {
  const [invitations, setInvitations] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MENTEE");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const refreshInvites = () => {
    // Stubbed until integrated with backend API
    setInvitations([]);
  };

  useEffect(() => {
    refreshInvites();
  }, []);

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    // Stubbed until integrated with backend API
    setInviteEmail("");
    setInviteRole("MENTEE");
    setShowInviteModal(false);
    refreshInvites();
  };

  const handleResend = (id) => {
    // Stubbed until integrated with backend API
    refreshInvites();
  };

  const handleCancel = (id) => {
    if (confirm("Are you sure you want to cancel this invitation?")) {
      // Stubbed until integrated with backend API
      refreshInvites();
    }
  };

  const filtered = invitations
    .filter(inv => statusFilter === "ALL" || inv.status === statusFilter)
    .filter(inv => inv.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const statusStyles = {
    PENDING: "bg-blue-50 text-blue-700 border-blue-200",
    ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Title & Actions bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Organization Invitations</h1>
          <p className="m-0 mt-1 text-slate-500 text-sm">Invite new administrators, mentors, and students and manage active requests.</p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 text-sm font-medium shrink-0"
        >
          + Invite Member
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <input
          placeholder="Search by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
        />
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          {["ALL", "PENDING", "ACCEPTED", "CANCELLED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === status
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm font-medium">No invitations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50">
                  {["Email Address", "Target Role", "Sent Date", "Status", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{inv.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 text-xs font-medium">{inv.role}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{inv.sentAt}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusStyles[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleResend(inv.id)}
                        disabled={inv.status === "ACCEPTED"}
                        className="text-xs px-3 py-1.5"
                      >
                        Resend
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleCancel(inv.id)}
                        disabled={inv.status === "ACCEPTED" || inv.status === "CANCELLED"}
                        className="text-xs px-3 py-1.5"
                      >
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal Overlay */}
      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={(e) => e.target === e.currentTarget && setShowInviteModal(false)}>
          <form onSubmit={handleSendInvite} className="bg-white rounded-xl p-8 w-full max-w-sm flex flex-col gap-6 shadow-xl">
            <div>
              <h3 className="m-0 text-xl font-bold text-slate-900">Invite New Member</h3>
              <p className="m-0 mt-1 text-slate-500 text-sm">An invitation email will be issued to join the workspace.</p>
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. user@organization.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                >
                  <option value="MENTEE">Mentee (Student)</option>
                  <option value="MENTOR">Mentor (Advisor)</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Send Invite
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
