import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../lib/api";
import { formatUIDate } from "../../lib/datetime";
import Button from "../ui/Button";
import { Close, Mail, Plus, Refresh, Search, Send } from "../ui/Icons";

const STATUS_LABELS = {
  ALL: "All",
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  CANCELLED: "Cancelled",
};

export default function InvitationsList() {
  const [invitations, setInvitations] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MENTEE");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const refreshInvites = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/invitations");
      setInvitations(res.data.data.invitations || []);
    } catch (err) {
      console.error("Failed to load invitations:", err);
      toast.error("Failed to load invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInvites();
  }, []);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setLoading(true);
      const defaultName = inviteEmail.split("@")[0].replace(/[._-]/g, " ");
      await api.post("/users/invite", {
        name: defaultName,
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success("Invitation sent successfully!");
      setInviteEmail("");
      setInviteRole("MENTEE");
      setShowInviteModal(false);
      refreshInvites();
    } catch (err) {
      console.error("Failed to send invitation:", err);
      const msg = err.response?.data?.message || "Failed to send invitation";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (id) => {
    try {
      setLoading(true);
      await api.post(`/users/invitations/${id}/resend`);
      toast.success("Invitation resent successfully!");
      refreshInvites();
    } catch (err) {
      console.error("Failed to resend invitation:", err);
      const msg = err.response?.data?.message || "Failed to resend invitation";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    try {
      setLoading(true);
      await api.delete(`/users/invitations/${id}`);
      toast.success("Invitation cancelled successfully!");
      refreshInvites();
    } catch (err) {
      console.error("Failed to cancel invitation:", err);
      const msg = err.response?.data?.message || "Failed to cancel invitation";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invitations
    .filter(inv => statusFilter === "ALL" || inv.status === statusFilter)
    .filter(inv => inv.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const statusStyles = {
    PENDING: "badge badge-info",
    ACCEPTED: "badge badge-success",
    CANCELLED: "badge badge-neutral",
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Invitations</h1>
          <p className="page-subtitle mt-1">
            Invite administrators, mentors and students, and track the requests you have already sent.
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="shrink-0">
          <Plus size={16} />
          Invite member
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              placeholder="Search by email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search invitations by email"
              className="input-field pl-9"
            />
          </div>
          <div className="tab-strip self-start sm:self-auto max-w-full overflow-x-auto scrollbar-none">
            {["ALL", "PENDING", "ACCEPTED", "CANCELLED"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                aria-pressed={statusFilter === status}
                className={"tab-item " + (statusFilter === status ? "tab-item-active" : "")}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invitations table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Mail size={22} />
            </div>
            <h2 className="empty-state-title">No invitations to show</h2>
            <p className="empty-state-text">
              Invitations you send appear here with their current status, so you can resend or cancel them.
            </p>
            <div className="mt-4">
              <Button onClick={() => setShowInviteModal(true)}>
                <Plus size={16} />
                Invite member
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-175">
              <thead>
                <tr>
                  {["Email address", "Role", "Sent", "Status", "Actions"].map(h => (
                    <th key={h} className={h === "Actions" ? "text-right" : undefined}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv._id}>
                    <td className="font-medium text-slate-900">{inv.email}</td>
                    <td>
                      <span className="badge badge-neutral">{inv.role}</span>
                    </td>
                    <td className="text-slate-600 whitespace-nowrap">
                      {formatUIDate(new Date(inv.createdAt))}
                    </td>
                    <td>
                      <span className={statusStyles[inv.status]}>
                        <span className="badge-dot opacity-70" aria-hidden="true" />
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResend(inv._id)}
                          disabled={inv.status === "ACCEPTED" || loading}
                        >
                          <Refresh size={14} />
                          Resend
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancel(inv._id)}
                          disabled={inv.status === "ACCEPTED" || inv.status === "CANCELLED" || loading}
                        >
                          <Close size={14} />
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite modal */}
      {showInviteModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowInviteModal(false)}>
          <form onSubmit={handleSendInvite} className="modal-panel max-w-md">
            <div className="modal-header">
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">Invite a member</h2>
                <p className="mt-1 text-sm text-slate-500">
                  They will receive an email with a link to join the workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                aria-label="Close dialog"
                title="Close"
                className="shrink-0 -mt-1 -mr-1 p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Close size={18} />
              </button>
            </div>

            <div className="px-6 pb-6 flex flex-col gap-4">
              <div>
                <label className="field-label">Email address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@organization.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="field-label">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="select-field"
                >
                  <option value="MENTEE">Mentee (student)</option>
                  <option value="MENTOR">Mentor (advisor)</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                <p className="field-hint">The role determines what the member can see and do once they join.</p>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowInviteModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {!loading && <Send size={15} />}
                {loading ? "Sending…" : "Send invite"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
