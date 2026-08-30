import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { ArrowRight } from "../ui/Icons";
import { finalCta as s } from "../../data/landingData";

/* ==========================================================================
   FinalCtaSection — one clear conversion block, no second agenda.
   ========================================================================== */

export default function FinalCtaSection() {
  const navigate = useNavigate();

  return (
    <section className="rounded-3xl bg-ink-900 px-6 py-14 text-center sm:px-10 sm:py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-400">
        {s.eyebrow}
      </p>
      <h2 className="mx-auto mt-4 max-w-2xl font-display text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[34px]">
        {s.title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">{s.subtitle}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={() => navigate("/signup")}>
          {s.primaryCta} <ArrowRight size={16} />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="border-white/15 text-slate-200 hover:bg-white/10 hover:text-white"
          onClick={() => navigate("/login")}
        >
          {s.secondaryCta}
        </Button>
      </div>
    </section>
  );
}
