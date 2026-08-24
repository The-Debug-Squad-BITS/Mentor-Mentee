import { useState } from "react";
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

export default function SignupForm({
  organizationName,
  setOrganizationName,
  adminName,
  setAdminName,
  email,
  setEmail,
  password,
  setPassword,
  fieldErrors,
  loading,
  error,
  onSubmit,
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

      {/* Organization Name */}
      <div>
        <label htmlFor="signup-organization" className="field-label">
          Organization name
        </label>
        <input
          id="signup-organization"
          type="text"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="BITS Pilani"
          required
          className={`input-field ${fieldErrors?.organizationName ? "input-field-error" : ""}`}
        />
        {fieldErrors?.organizationName && (
          <p className="field-error">{fieldErrors.organizationName}</p>
        )}
      </div>

      {/* Admin Full Name */}
      <div>
        <label htmlFor="signup-admin-name" className="field-label">
          Your full name
        </label>
        <input
          id="signup-admin-name"
          type="text"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          placeholder="Jane Smith"
          required
          className={`input-field ${fieldErrors?.adminName ? "input-field-error" : ""}`}
        />
        {fieldErrors?.adminName && (
          <p className="field-error">{fieldErrors.adminName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className="field-label">
          Work email address
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@institution.edu"
          required
          className={`input-field ${fieldErrors?.email ? "input-field-error" : ""}`}
        />
        {fieldErrors?.email && (
          <p className="field-error">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className="field-label">
          Password
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            className={`input-field pr-11 ${fieldErrors?.password ? "input-field-error" : ""}`}
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
        {fieldErrors?.password ? (
          <p className="field-error">{fieldErrors.password}</p>
        ) : (
          <p className="field-hint">Use at least 8 characters.</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading}
        className="mt-1 w-full"
      >
        {loading && <Spinner />}
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
