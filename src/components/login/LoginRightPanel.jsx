import { useNavigate } from "react-router-dom";
import { StarIcon } from "../ui/Icons";
import { GoogleIcon } from "../ui/Icons";
import LoginForm from "./LoginForm";

function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-5 text-[#C5BEB8] text-[12px] tracking-[0.06em]">
      <div className="flex-1 h-px bg-[#E2DDD8]" />
      {label}
      <div className="flex-1 h-px bg-[#E2DDD8]" />
    </div>
  );
}

export default function LoginRightPanel({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onSubmit,
  onGoogleLogin,
  onNavigate,
  onBack,
  onForgotPassword,
}) {
  const navigate = useNavigate();

  const handleHome = () => {
    if (onNavigate) onNavigate("home");
    else if (onBack) onBack();
    else navigate("/");
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
            Welcome back
          </p>
          <h2 className="font-['Fraunces',serif] text-[30px] font-light text-[#1A1714] leading-[1.2]">
            Sign in to your account
          </h2>
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={onGoogleLogin}
          className="w-full flex items-center gap-3 px-4.5 py-3.25 bg-white border border-[#E2DDD8] rounded-xl cursor-pointer text-[14px] text-[#1A1714] mb-5 transition-colors duration-150 font-['DM_Sans',sans-serif] hover:border-[#C5BEB8]"
        >
          <GoogleIcon />
          <span className="flex-1 text-center mr-4.5">
            Continue with Google
          </span>
        </button>

        <Divider label="or sign in with email" />

        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          error={error}
          onSubmit={onSubmit}
          onForgotPassword={onForgotPassword}
        />

        <p className="text-center mt-5.5 text-[13px] text-[#9C948C]">
          New here?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/signup");
            }}
            className="text-[#1A1714] font-medium no-underline border-b border-[#C5BEB8]"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
