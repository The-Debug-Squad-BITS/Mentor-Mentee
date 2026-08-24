import { useState, useEffect } from "react";
import api from "../../lib/api";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import { AlertCircle, Close, Eye, EyeOff } from "../ui/Icons";

/* Presentational: inline spinner shown inside a submitting button. */
function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="15"
      height="15"
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

export default function ResetPasswordModal({ initialEmail, onClose }) {
  const [step, setStep] = useState(1); // 1 = Request Code, 2 = Reset Password
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cooldown timer in seconds for resending verification code
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Cooldown Clock Tick Effect ──────────────────────────────────────────
  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // ── Step 1: Send Request Code ────────────────────────────────────────────
  const handleRequestCode = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim()
      });

      toast.success("Verification code sent to your registered email!");

      // Keep code field empty for manual user entry
      setCode("");

      setResendCooldown(30); // 30s rate-limiting cooldown
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to request verification code. Please make sure the email is registered."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Resend Code Logic ────────────────────────────────────────────────────
  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim()
      });
      toast.success("A fresh verification code has been dispatched!");
      setResendCooldown(30);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to resend code. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify Code and Reset Password ────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email: email.trim(),
        code: code.trim(),
        newPassword
      });

      toast.success("Password reset successfully! You can now log in.");
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Password reset failed. Please check your verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop items-end p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-panel max-w-md rounded-b-none sm:rounded-b-2xl">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <p className="eyebrow">Step {step} of 2</p>
            <h2 className="mt-1.5 font-display text-[17px] font-bold tracking-tight text-slate-900">
              Reset your password
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
              {step === 1
                ? "Confirm your email to request a reset code"
                : "Enter the code sent to your mail and set your new password"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Close size={18} />
          </button>
        </div>

        {step === 1 ? (
          /* ══ STEP 1: REQUEST CODE FORM ══════════════════════════════ */
          <form onSubmit={handleRequestCode}>
            <div className="flex flex-col gap-4 px-6 pb-5">
              {error && (
                <div className="notice notice-danger" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="field-label">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  className="input-field"
                  disabled={loading}
                />
                <p className="field-hint">
                  We will email a verification code to this address if it is registered.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading && <Spinner />}
                {loading ? "Requesting..." : "Send Reset Code"}
              </Button>
            </div>
          </form>
        ) : (
          /* ══ STEP 2: VERIFY CODE & RESET PASSWORD FORM ══════════════ */
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-4 px-6 pb-5">
              {error && (
                <div className="notice notice-danger" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label htmlFor="reset-new-password" className="field-label">
                  New password{" "}
                  <span className="font-normal text-slate-500">(min. 8 chars)</span>
                </label>
                <div className="relative">
                  <input
                    id="reset-new-password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="At least 8 characters"
                    className="input-field pr-11"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                    title={showNewPassword ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="reset-confirm-password" className="field-label">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Repeat your new password"
                    className="input-field pr-11"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Reset Code */}
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor="reset-code" className="field-label">
                    Verification code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    className="bg-transparent text-[13px] font-medium text-brand-600 hover:text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-500 disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend Code"}
                  </button>
                </div>
                <input
                  id="reset-code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 9B2K5R"
                  className="input-field text-center font-mono text-base tracking-[0.35em]"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="modal-footer">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading && <Spinner />}
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
