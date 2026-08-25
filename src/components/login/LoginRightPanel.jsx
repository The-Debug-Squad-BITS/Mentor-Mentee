import { useNavigate } from "react-router-dom";
import Brand from "../ui/Brand";
import { ArrowLeft } from "../ui/Icons";
import LoginForm from "./LoginForm";

export default function LoginRightPanel({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onSubmit,
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
    <div className="scrollbar-slim flex w-full flex-col bg-white px-5 py-8 sm:px-10 lg:h-full lg:overflow-y-auto lg:px-14 lg:py-10">
      {/* Compact brand header — replaces the dark panel below lg */}
      <div className="mx-auto flex w-full max-w-sm items-center gap-2.5 lg:hidden">
        <Brand size="lg" />
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
        <div className="mb-6">
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-2 font-display text-[26px] font-bold leading-tight tracking-tight text-slate-900 xl:text-[28px]">
            Sign in to Trellis
          </h1>
          <p className="page-subtitle mt-2">
            Use the credentials issued by your institution.
          </p>
        </div>

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

        <p className="mt-6 text-center text-[13px] text-slate-600">
          New here?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/signup");
            }}
            className="font-semibold text-brand-600 no-underline hover:text-brand-700 hover:underline"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
