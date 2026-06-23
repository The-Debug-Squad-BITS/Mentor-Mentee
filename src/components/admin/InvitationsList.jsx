import { useState, useEffect } from "react";
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
    PENDING: "bg-blue-50 text-blue-600 border-blue-100",
    ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    CANCELLED: "bg-rose-50 text-rose-500 border-rose-100",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Actions bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">Organization Invitations</h1>
          <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Invite new administrators, mentors, and students and manage active requests.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-3 rounded-xl border-none text-xs cursor-pointer transition-colors shadow-lg shadow-blue-500/20"
          style={{ fontFamily: "inherit" }}
        >
          + Invite Member
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        <input
          placeholder="Search by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 bg-slate-50 font-sans"
        />
        <div className="flex gap-2">
          {["ALL", "PENDING", "ACCEPTED", "CANCELLED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === status
                  ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/10"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">No invitations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-150">
              <thead>
                <tr className="bg-slate-50">
                  {["Email Address", "Target Role", "Sent Date", "Status", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-800 text-xs md:text-sm">{inv.email}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-bold">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">{inv.role}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{inv.sentAt}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${statusStyles[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleResend(inv.id)}
                        disabled={inv.status === "ACCEPTED"}
                        className="bg-transparent border border-blue-200 hover:border-blue-400 disabled:opacity-30 disabled:pointer-events-none px-3 py-1.5 rounded-lg text-xs font-bold text-blue-500 cursor-pointer transition-colors"
                        style={{ fontFamily: "inherit" }}
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => handleCancel(inv.id)}
                        disabled={inv.status === "ACCEPTED" || inv.status === "CANCELLED"}
                        className="bg-transparent border border-red-200 hover:border-red-400 disabled:opacity-30 disabled:pointer-events-none px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 cursor-pointer transition-colors"
                        style={{ fontFamily: "inherit" }}
                      >
                        Cancel
                      </button>
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
        <div className="fixed inset-0 flex items-center justify-center z-250 p-4" style={{ background: "rgba(15,23,42,0.5)" }} onClick={(e) => e.target === e.currentTarget && setShowInviteModal(false)}>
          <form onSubmit={handleSendInvite} className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col gap-5" style={{ boxShadow: "0 24px 80px rgba(59,130,246,0.15)" }}>
            <div>
              <h3 className="m-0 text-lg font-black text-slate-800">Invite New Member</h3>
              <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">An invitation email will be issued to join the workspace.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. user@organization.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 font-sans"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 bg-white"
                  style={{ fontFamily: "inherit" }}
                >
                  <option value="MENTEE">Mentee (Student)</option>
                  <option value="MENTOR">Mentor (Advisor)</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl border-none bg-blue-500 hover:bg-blue-600 text-xs font-bold text-white cursor-pointer transition-colors shadow-md shadow-blue-500/10"
                style={{ fontFamily: "inherit" }}
              >
                Send Invite
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
