import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

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
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center px-4 font-['DM_Sans',sans-serif]">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2DDD8] p-10">

          {/* Header */}
          <div className="mb-8">
            <div className="w-10 h-10 bg-[#E8B86D] rounded-xl flex items-center justify-center mb-5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#1A1714" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-[11px] font-medium tracking-[0.18em] text-[#B09070] uppercase mb-2">
              Security
            </p>
            <h1 className="font-['Fraunces',serif] text-[28px] font-light text-[#1A1714] leading-[1.2]">
              Set your new password
            </h1>
            <p className="text-[13px] text-[#9C948C] mt-2 leading-relaxed">
              {user?.mustChangePassword
                ? "You must set a new password before you can continue."
                : "Enter your current password and choose a new one."}
            </p>
          </div>

          {/* ── Success state ────────────────────────────────────── */}
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-medium text-[#1A1714]">Password changed successfully!</p>
                <p className="text-[13px] text-[#9C948C] mt-1">Redirecting to your dashboard…</p>
              </div>
            </div>

          ) : (
            /* ── Form ──────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Error banner */}
              {error && (
                <div className="text-[12px] text-[#B91C1C] px-3.5 py-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl leading-relaxed">
                  {error}
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-[12px] font-medium text-[#7A736C] mb-1.5 tracking-[0.04em]">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Your current password"
                    required
                    className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2DDD8] rounded-xl text-sm text-[#1A1714] outline-none transition-colors duration-150 focus:border-[#B09070] focus:bg-white pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[12px] font-bold text-stone-400 cursor-pointer hover:text-stone-600 select-none font-sans"
                  >
                    {showCurrent ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[12px] font-medium text-[#7A736C] mb-1.5 tracking-[0.04em]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2DDD8] rounded-xl text-sm text-[#1A1714] outline-none transition-colors duration-150 focus:border-[#B09070] focus:bg-white pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[12px] font-bold text-stone-400 cursor-pointer hover:text-stone-600 select-none font-sans"
                  >
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[12px] font-medium text-[#7A736C] mb-1.5 tracking-[0.04em]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    required
                    className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2DDD8] rounded-xl text-sm text-[#1A1714] outline-none transition-colors duration-150 focus:border-[#B09070] focus:bg-white pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[12px] font-bold text-stone-400 cursor-pointer hover:text-stone-600 select-none font-sans"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="change-password-submit"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 bg-[#E8B86D] text-[#1A1714] text-sm font-medium rounded-xl border-0 cursor-pointer tracking-wide transition-opacity duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Changing password…" : "Change Password"}
              </button>
            </form>
          )}
        </div>

        {/* Back to dashboard link (only shown if NOT a forced first-login) */}
        {!user?.mustChangePassword && !success && (
          <p className="text-center mt-5 text-[13px] text-[#9C948C]">
            <button
              onClick={() => navigate(dashboardPath())}
              className="text-[#1A1714] font-medium border-b border-[#C5BEB8] bg-transparent border-0 border-b cursor-pointer"
              style={{ borderTop: "none", borderLeft: "none", borderRight: "none" }}
            >
              ← Back to dashboard
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
