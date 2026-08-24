import { useNavigate } from "react-router-dom";
import { Logo, ArrowLeft } from "../ui/Icons";
import Button from "../ui/Button";
import SignupForm from "./SignupForm";

export default function SignupRightPanel({
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
  onNavigate,
  onBack,
}) {
  const navigate = useNavigate();

  const handleHome = () => {
    if (onNavigate) onNavigate("home");
    else if (onBack) onBack();
    else navigate("/");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate("login");
    else navigate("/login");
  };

  return (
    <div className="flex w-full flex-col bg-white px-5 py-8 sm:px-10 lg:px-14 lg:py-12">
      {/* Compact brand header — replaces the dark panel below lg */}
      <div className="mx-auto flex w-full max-w-sm items-center gap-2.5 lg:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Logo size={20} />
        </span>
        <span className="font-display text-[16px] font-bold tracking-tight text-slate-900">
          Mentora
        </span>
        <button
          onClick={handleHome}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          Home
        </button>
      </div>

      <div className="mx-auto my-auto w-full max-w-sm pt-10 lg:pt-0">
        {/* Header */}
        <div className="mb-7">
          <p className="eyebrow">Register your organization</p>
          <h1 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-tight text-slate-900">
            Create your admin account
          </h1>
          <p className="page-subtitle mt-2">
            One admin registers the organization, then invites mentors and
            mentees from the dashboard.
          </p>
        </div>

        <SignupForm
          organizationName={organizationName}
          setOrganizationName={setOrganizationName}
          adminName={adminName}
          setAdminName={setAdminName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          fieldErrors={fieldErrors}
          loading={loading}
          error={error}
          onSubmit={onSubmit}
        />

        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={handleHome}
          className="mt-4 w-full"
        >
          <ArrowLeft size={16} />
          Back to home
        </Button>

        <p className="mt-6 text-center text-[13px] text-slate-600">
          Already have an account?{" "}
          <a
            href="#"
            onClick={handleLogin}
            className="font-semibold text-brand-600 no-underline hover:text-brand-700 hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
