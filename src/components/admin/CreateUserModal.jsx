import { useState } from "react";
import api from "../../lib/api";
import Button from "../ui/Button";
import { AlertCircle, CheckCircle, Close, Send } from "../ui/Icons";

export default function CreateUserModal({ onClose, onUserCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MENTEE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(null);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      await api.post("/users/invite", { name: name.trim(), email: email.trim(), role });
      setSuccessMsg("Invitation sent! They will receive login credentials via email.");
      // Auto-close after showing success
      setTimeout(() => {
        if (onUserCreated) onUserCreated();
        onClose();
      }, 1800);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("This email is already registered.");
      } else if (err.response?.status === 400) {
        // Field-level validation errors
        const errors = err.response.data.errors;
        if (Array.isArray(errors)) {
          const mapped = {};
          errors.forEach((e) => { if (e.field) mapped[e.field] = e.message || e.msg; });
          setFieldErrors(mapped);
        } else {
          setError(err.response.data.message || "Validation error. Check all fields.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
      console.error("Invite user error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-panel max-w-md">
        <div className="modal-header">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">
              Invite a user
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Send an invitation to a mentor or mentee.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            title="Close"
            className="shrink-0 -mt-1 -mr-1 p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <Close size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Success Message */}
          {successMsg && (
            <div className="notice notice-success">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="notice notice-danger">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="field-label">Full name</label>
            <input
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`input-field ${fieldErrors.name ? "input-field-error" : ""}`}
              disabled={loading || !!successMsg}
            />
            {fieldErrors.name && (
              <span className="field-error block">{fieldErrors.name}</span>
            )}
          </div>

          <div>
            <label className="field-label">Email address</label>
            <input
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input-field ${fieldErrors.email ? "input-field-error" : ""}`}
              disabled={loading || !!successMsg}
            />
            {fieldErrors.email && (
              <span className="field-error block">{fieldErrors.email}</span>
            )}
          </div>

          <div>
            <label className="field-label">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="select-field"
              disabled={loading || !!successMsg}
            >
              <option value="MENTEE">MENTEE</option>
              <option value="MENTOR">MENTOR</option>
            </select>
            <p className="field-hint">Mentees join projects as students; mentors review and guide them.</p>
          </div>
        </div>

        <div className="modal-footer">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !!successMsg}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <Send size={15} />
                Send Invitation
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
