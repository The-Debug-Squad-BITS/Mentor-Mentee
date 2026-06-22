import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [currentPassword, setCurrentPassword]   = useState("");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [error, setError]                       = useState("");
  const [loading, setLoading]                   = useState(false);
  const [success, setSuccess]                   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
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

      setTimeout(() => {
        if (user?.role === "ADMIN")  navigate("/admin/dashboard");
        if (user?.role === "MENTOR") navigate("/mentor/dashboard");
        if (user?.role === "MENTEE") navigate("/mentee/dashboard");
      }, 1200);

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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E2DDD8] p-10">
        {/* Header */}
        <div className="mb-8">
          <div className="w-10 h-10 bg-[#E8B86D] rounded-xl flex items-center justify-center mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1714" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
          <p className="text-[13px] text-[#9C948C] mt-2">
            {user?.mustChangePassword
              ? "You must set a new password before continuing."
              : "Enter your current password and choose a new one."}
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-[#1A1714]">Password changed successfully!</p>
            <p className="text-[13px] text-[#9C948C]">Redirecting to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Error banner */}
            {error && (
              <div className="text-xs text-red-700 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl leading-relaxed">
                {error}
              </div>
            )}

            {/* Current password */}
            <div>
              <label className="block text-xs font-medium text-[#6B6560] mb-1.5 tracking-wide">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Your current password"
                required
                className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2DDD8] rounded-xl text-sm text-[#1A1714] outline-none transition-colors duration-150 focus:border-[#B09070] focus:bg-white"
              />
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-medium text-[#6B6560] mb-1.5 tracking-wide">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2DDD8] rounded-xl text-sm text-[#1A1714] outline-none transition-colors duration-150 focus:border-[#B09070] focus:bg-white"
              />
            </div>

            {/* Confirm new password */}
            <div>
              <label className="block text-xs font-medium text-[#6B6560] mb-1.5 tracking-wide">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
                className="w-full px-4 py-3 bg-[#FAFAF9] border border-[#E2DDD8] rounded-xl text-sm text-[#1A1714] outline-none transition-colors duration-150 focus:border-[#B09070] focus:bg-white"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-[#E8B86D] text-[#1A1714] text-sm font-medium rounded-xl border-0 cursor-pointer tracking-wide transition-opacity duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Changing password…" : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
