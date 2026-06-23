import { useState } from "react";
import api from "../../lib/api";

const inputStyle =
  "w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm outline-none transition-colors focus:border-blue-400";

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
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(15,23,42,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-3xl p-10 w-full max-w-sm"
        style={{ boxShadow: "0 24px 80px rgba(59,130,246,0.15)" }}
      >
        <h2 className="m-0 mb-1.5 text-xl font-black text-slate-800">
          Invite New User
        </h2>
        <p className="m-0 mb-7 text-slate-400 text-sm">
          Send an invitation to a mentor or mentee.
        </p>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 font-semibold">
            ✅ {successMsg}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-semibold">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Full Name
            </label>
            <input
              placeholder="e.g., John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyle}
              style={{ fontFamily: "inherit" }}
              disabled={loading || !!successMsg}
            />
            {fieldErrors.name && (
              <span className="text-[10px] text-red-500 mt-1 block">{fieldErrors.name}</span>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Email Address
            </label>
            <input
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
              style={{ fontFamily: "inherit" }}
              disabled={loading || !!successMsg}
            />
            {fieldErrors.email && (
              <span className="text-[10px] text-red-500 mt-1 block">{fieldErrors.email}</span>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Role Assignment
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputStyle}
              style={{ fontFamily: "inherit", background: "#fff" }}
              disabled={loading || !!successMsg}
            >
              <option value="MENTEE">MENTEE</option>
              <option value="MENTOR">MENTOR</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 border border-slate-200 bg-white rounded-xl font-bold text-sm text-slate-500 cursor-pointer hover:border-slate-300 transition-colors"
            style={{ fontFamily: "inherit" }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !!successMsg}
            className="flex-1 py-3.5 border-0 rounded-xl font-bold text-sm text-white cursor-pointer disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
              boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
