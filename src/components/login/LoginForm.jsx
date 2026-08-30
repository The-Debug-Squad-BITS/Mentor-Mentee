import { useState } from "react";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import { AlertCircle, Eye, EyeOff } from "../ui/Icons";

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
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Global error */}
      {error && (
        <div className="notice notice-danger" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="login-email" className="field-label">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@institution.edu"
          required
          className="input-field"
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="login-password" className="field-label">
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
            className="text-[13px] font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="input-field pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading}
        className="mt-1 w-full"
      >
        {loading && <Spinner />}
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
