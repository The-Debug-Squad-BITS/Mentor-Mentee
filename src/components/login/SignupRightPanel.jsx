import { useNavigate } from "react-router-dom";
import { StarIcon } from "../ui/Icons";
import SignupForm from "./SignupForm";

function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-5 text-[#C5BEB8] text-[12px] tracking-[0.06em]">
      <div className="flex-1 h-px bg-[#E2DDD8]" />
      {label}
      <div className="flex-1 h-px bg-[#E2DDD8]" />
    </div>
  );
}

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
    <div className="bg-[#F7F4EF] flex flex-col items-center lg:items-start px-5 sm:px-10 lg:px-14 py-10 lg:py-12 h-full overflow-y-auto w-full">
      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-2.5 mb-10 w-full max-w-90">
        <div className="w-8 h-8 bg-[#E8B86D] rounded-[9px] flex items-center justify-center">
          <StarIcon size={14} />
        </div>
        <span className="text-[#1A1714] text-[15px] font-medium tracking-[0.01em]">
          Mentora
        </span>
        <button
          onClick={handleHome}
          className="ml-auto text-[12px] text-[#B09070] border border-[#E2DDD8] rounded-full px-3.5 py-1.5 cursor-pointer font-['DM_Sans',sans-serif] hover:border-[#C5BEB8] transition-colors duration-150"
        >
          ← Home
        </button>
      </div>

      <div className="max-w-90 w-full my-auto">
        {/* Header */}
        <div className="mb-9">
          <p className="text-[11px] font-medium tracking-[0.18em] text-[#B09070] uppercase mb-2.5">
            Register your organization
          </p>
          <h2 className="font-['Fraunces',serif] text-[30px] font-light text-[#1A1714] leading-[1.2]">
            Create your account
          </h2>
          <p className="text-[13px] text-[#9C948C] mt-2 leading-relaxed">
            One admin registers the organization — then invite your mentors and mentees from the dashboard.
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

        <Divider label="or" />

        {/* Back to home */}
        <button
          onClick={handleHome}
          className="w-full py-3.25 bg-white text-[#1A1714] border border-[#E2DDD8] rounded-xl text-[14px] font-medium cursor-pointer font-['DM_Sans',sans-serif] hover:border-[#C5BEB8] hover:bg-[#FDFCFB] transition-all duration-150"
        >
          ← Back to home
        </button>

        <p className="text-center mt-5.5 text-[13px] text-[#9C948C]">
          Already have an account?{" "}
          <a
            href="#"
            onClick={handleLogin}
            className="text-[#1A1714] font-medium no-underline border-b border-[#C5BEB8]"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
