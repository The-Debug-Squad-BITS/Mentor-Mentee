import { useState, useEffect } from "react";
import api from "../../lib/api";
import { toast } from "react-toastify";

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
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      style={{ background: "rgba(15,23,42,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 flex flex-col gap-5 animate-fade-in"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
      >
        {/* Modal Header */}
        <div>
          <h2 className="m-0 mb-1 text-lg font-black text-slate-800">
            Reset Password
          </h2>
          <p className="m-0 text-slate-400 text-xs font-semibold">
            {step === 1 
              ? "Confirm your email to request a reset code" 
              : "Enter the code sent to your mail and set your new password"}
          </p>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {step === 1 ? (
          /* ══ STEP 1: REQUEST CODE FORM ══════════════════════════════ */
          <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2DDD8] rounded-xl text-sm text-[#1A1714] outline-none transition-colors duration-150 focus:border-[#B09070]"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 border border-slate-200 bg-white rounded-xl font-bold text-xs text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 border-none bg-[#1A1714] hover:bg-[#2E2A26] text-[#F7F4EF] rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-md disabled:opacity-60"
                style={{ fontFamily: "inherit" }}
              >
                {loading ? "Requesting..." : "Send Reset Code"}
              </button>
            </div>
          </form>
        ) : (
          /* ══ STEP 2: VERIFY CODE & RESET PASSWORD FORM ══════════════ */
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            
            {/* New Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                New Password <span className="text-slate-300 font-normal">(min. 8 chars)</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2DDD8] rounded-xl text-sm text-[#1A1714] outline-none transition-colors duration-150 focus:border-[#B09070] pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[12px] font-bold text-stone-400 cursor-pointer hover:text-stone-600 select-none font-sans"
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="mb-2">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2DDD8] rounded-xl text-sm text-[#1A1714] outline-none transition-colors duration-150 focus:border-[#B09070] pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[12px] font-bold text-stone-400 cursor-pointer hover:text-stone-600 select-none font-sans"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Reset Code */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  className="bg-transparent border-none text-[11px] font-bold text-indigo-600 hover:text-indigo-800 disabled:text-stone-400 cursor-pointer disabled:cursor-not-allowed select-none font-sans"
                >
                  {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend Code"}
                </button>
              </div>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 9B2K5R"
                className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2DDD8] rounded-xl text-sm text-[#1A1714] font-mono outline-none tracking-widest text-center transition-colors duration-150 focus:border-[#B09070]"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1 py-3 border border-slate-200 bg-white rounded-xl font-bold text-xs text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ fontFamily: "inherit" }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 border-none bg-[#1A1714] hover:bg-[#2E2A26] text-[#F7F4EF] rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-md disabled:opacity-60"
                style={{ fontFamily: "inherit" }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
