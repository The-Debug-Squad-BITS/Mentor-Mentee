import { useNavigate } from "react-router-dom";
import { Logo, ArrowLeft, Layers, Target, CheckCircle } from "../ui/Icons";

/* Presentational: one proof point row on the dark brand panel. */
function ProofPoint({ icon, title, text }) {
  return (
    <li className="flex gap-3.5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-brand-300">
        {icon}
      </span>
      <div>
        <p className="text-[14px] font-semibold text-white">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{text}</p>
      </div>
    </li>
  );
}

export default function LoginLeftPanel({ onNavigate, onBack }) {
  const navigate = useNavigate();

  const handleHome = () => {
    if (onNavigate) onNavigate("home");
    else if (onBack) onBack();
    else navigate("/");
  };

  return (
    <div className="surface-ink hidden lg:flex flex-col justify-between p-12 xl:p-14">
      {/* Brand row */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Logo size={20} />
        </span>
        <span className="font-display text-[16px] font-bold tracking-tight text-white">
          Mentora
        </span>
        <button
          onClick={handleHome}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[13px] font-medium text-slate-300 transition-colors duration-150 hover:bg-white/[0.12] hover:text-white"
        >
          <ArrowLeft size={14} />
          Home
        </button>
      </div>

      {/* Positioning */}
      <div className="max-w-md py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
          Project management for institutions
        </p>
        <h1 className="mt-4 font-display text-[40px] font-bold leading-[1.12] tracking-tight text-white xl:text-[44px]">
          Run every mentor–mentee project in one place.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
          Mentora gives students, mentors and faculty a shared workspace for
          academic projects — from kickoff to final review.
        </p>
      </div>

      {/* Proof points */}
      <ul className="flex max-w-md flex-col gap-6 border-t border-white/10 pt-8">
        <ProofPoint
          icon={<Layers size={18} />}
          title="Projects with clear ownership"
          text="Pair mentees with a mentor and keep scope, team and status together."
        />
        <ProofPoint
          icon={<Target size={18} />}
          title="Milestones that stay on track"
          text="Break work into milestones with due dates and watch progress move."
        />
        <ProofPoint
          icon={<CheckCircle size={18} />}
          title="Submissions and reviews in one thread"
          text="Mentees submit work, mentors review and leave feedback in context."
        />
      </ul>
    </div>
  );
}
