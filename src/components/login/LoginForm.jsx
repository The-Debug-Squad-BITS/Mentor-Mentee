import { useState } from "react";
import { toast } from "react-toastify";

const inputClass =
  "w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-[#1A1714] outline-none font-sans transition-colors duration-150 focus:border-[#1A1714]";

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onSubmit,
  onForgotPassword,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="mt-1">
      {/* Error */}
      {error && (
        <div className="text-xs text-red-700 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl mb-4 leading-relaxed">
          {error}
        </div>
      )}

      {/* Email */}
      <div className="mb-3.5">
        <label className="block text-xs font-medium text-stone-600 mb-1.5 tracking-wide">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className={inputClass}
        />
      </div>

      {/* Password */}
      <div className="mb-1">
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-stone-600 tracking-wide">
            Password
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!email || !email.trim()) {
                toast.warning("Please enter your email address first to reset your password.");
                return;
              }
              if (onForgotPassword) onForgotPassword();
            }}
            className="text-xs text-stone-400 border-b border-stone-300 hover:text-[#1A1714] hover:border-[#1A1714] transition-colors"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[12px] font-bold text-stone-400 cursor-pointer hover:text-stone-600 select-none font-sans"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-5 py-3.5 bg-[#1A1714] text-[#F7F4EF] text-sm font-medium rounded-xl border-none cursor-pointer tracking-wide transition-colors duration-150 hover:bg-[#2E2A26] disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ fontFamily: "inherit" }}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
