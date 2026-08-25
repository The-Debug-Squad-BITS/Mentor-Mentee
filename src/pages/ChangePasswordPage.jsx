import { useState, useEffect } from "react";
import Brand from "../components/ui/Brand";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import Button from "../components/ui/Button";
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "../components/ui/Icons";

/* Presentational: inline spinner shown inside the submit button. */
function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Presentational: password field with a show/hide toggle. */
function PasswordField({ id, label, value, onChange, placeholder, visible, onToggle }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="input-field pr-11"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState("");
  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState(false);

  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  // Guard: must be logged in to access this page
  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
    }
  }, [token, user, navigate]);

  // Helper: role-based dashboard path
  const dashboardPath = () => {
    if (user?.role === "ADMIN")  return "/admin/dashboard";
    if (user?.role === "MENTOR") return "/mentor/dashboard";
    return "/mentee/dashboard";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ── Client-side validation (per guide requirements) ────────────────
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      // Update Zustand store — user no longer needs to change password
      updateUser({ mustChangePassword: false });
      setSuccess(true);

      // Redirect to correct dashboard after brief success display
      setTimeout(() => navigate(dashboardPath()), 1200);

    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setError(data.errors.map((e) => e.message).join(" "));
      } else {
        setError(data?.message || "Password change failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <Brand size="lg" />
        </div>

        {/* Card */}
        <div className="card p-8">

          {/* Header */}
          <div className="mb-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600">
              <Lock size={20} />
            </div>
            <p className="eyebrow">Account security</p>
            <h1 className="page-title mt-2">Set a new password</h1>
            <p className="page-subtitle mt-2">
              {user?.mustChangePassword
                ? "You must set a new password before you can continue."
                : "Enter your current password and choose a new one."}
            </p>
          </div>

          {/* ── Success state ────────────────────────────────────── */}
          {success ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-success-200 bg-success-50 text-success-600">
                <CheckCircle size={26} />
              </div>
              <div>
                <p className="font-display text-[15px] font-bold text-slate-900">
                  Password changed successfully
                </p>
                <p className="mt-1 text-[13px] text-slate-600">
                  Taking you to your dashboard…
                </p>
              </div>
            </div>

          ) : (
            /* ── Form ──────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Error banner */}
              {error && (
                <div className="notice notice-danger" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Current Password */}
              <PasswordField
                id="current-password"
                label="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Your current password"
                visible={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
              />

              {/* New Password */}
              <PasswordField
                id="new-password"
                label="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                visible={showNew}
                onToggle={() => setShowNew(!showNew)}
              />

              {/* Confirm New Password */}
              <PasswordField
                id="confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                visible={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />

              {/* Requirements */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                <p className="text-[12px] font-semibold text-slate-700">
                  Password requirements
                </p>
                <ul className="mt-2 flex flex-col gap-1.5 text-[12.5px] text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check size={14} />
                    At least 8 characters long
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} />
                    Both new password fields must match
                  </li>
                </ul>
              </div>

              {/* Submit */}
              <Button
                id="change-password-submit"
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="mt-1 w-full"
              >
                {loading && <Spinner />}
                {loading ? "Changing password…" : "Change Password"}
              </Button>
            </form>
          )}
        </div>

        {/* Back to dashboard link (only shown if NOT a forced first-login) */}
        {!user?.mustChangePassword && !success && (
          <div className="mt-5 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(dashboardPath())}
            >
              <ArrowLeft size={15} />
              Back to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
