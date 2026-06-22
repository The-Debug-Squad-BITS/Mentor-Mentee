const inputClass =
  "w-full px-4 py-3 bg-white border border-[#E2DDD8] rounded-xl text-[14px] text-[#1A1714] outline-none transition-colors duration-150 font-['DM_Sans',sans-serif] focus:border-[#1A1714]";

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
  return (
    <form onSubmit={onSubmit} className="mt-1">
      {/* Global error banner */}
      {error && (
        <div className="text-[12px] text-[#B91C1C] px-3.5 py-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl mb-3.5 leading-normal">
          {error}
        </div>
      )}

      {/* Organization Name */}
      <div className="mb-3.5">
        <label className="block text-[12px] font-medium text-[#7A736C] mb-1.5 tracking-[0.04em]">
          Organization Name
        </label>
        <input
          type="text"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="BITS Pilani, Acme Corp…"
          required
          className={`${inputClass} ${fieldErrors?.organizationName ? "border-[#FECACA]" : ""}`}
        />
        {fieldErrors?.organizationName && (
          <p className="text-[11px] text-[#B91C1C] mt-1">{fieldErrors.organizationName}</p>
        )}
      </div>

      {/* Admin Full Name */}
      <div className="mb-3.5">
        <label className="block text-[12px] font-medium text-[#7A736C] mb-1.5 tracking-[0.04em]">
          Your Full Name
        </label>
        <input
          type="text"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          placeholder="Jane Smith"
          required
          className={`${inputClass} ${fieldErrors?.adminName ? "border-[#FECACA]" : ""}`}
        />
        {fieldErrors?.adminName && (
          <p className="text-[11px] text-[#B91C1C] mt-1">{fieldErrors.adminName}</p>
        )}
      </div>

      {/* Email */}
      <div className="mb-3.5">
        <label className="block text-[12px] font-medium text-[#7A736C] mb-1.5 tracking-[0.04em]">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className={`${inputClass} ${fieldErrors?.email ? "border-[#FECACA]" : ""}`}
        />
        {fieldErrors?.email && (
          <p className="text-[11px] text-[#B91C1C] mt-1">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="mb-1.5">
        <label className="block text-[12px] font-medium text-[#7A736C] mb-1.5 tracking-[0.04em]">
          Password <span className="text-[#C5BEB8] font-normal">(min. 8 characters)</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className={`${inputClass} ${fieldErrors?.password ? "border-[#FECACA]" : ""}`}
        />
        {fieldErrors?.password && (
          <p className="text-[11px] text-[#B91C1C] mt-1">{fieldErrors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#1A1714] text-[#F7F4EF] border-none rounded-xl text-[14px] font-medium cursor-pointer font-['DM_Sans',sans-serif] tracking-[0.01em] mt-4 transition-colors duration-150 hover:bg-[#2E2A26] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
