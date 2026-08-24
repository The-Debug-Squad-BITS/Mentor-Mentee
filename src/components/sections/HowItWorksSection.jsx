import { Icon } from "../ui/Icons";
import { howItWorksSection as s, howItWorks } from "../../data/landingData";

/* ==========================================================================
   HowItWorksSection — the real lifecycle of a project in Mentora, ordered.
   The connecting rail is drawn only from `sm` up, where the grid is stable.
   ========================================================================== */

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          {s.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{s.subtitle}</p>
      </div>

      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {howItWorks.map((step, i) => {
          const Glyph = Icon[step.icon] || Icon.Check;
          return (
            <li key={step.title} className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-white">
                  <Glyph size={17} />
                </span>
                <span className="font-display text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400 tabular-nums">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-display text-[15px] font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">{step.desc}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
