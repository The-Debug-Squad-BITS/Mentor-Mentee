import { Icon } from "../ui/Icons";
import { problemSection as s } from "../../data/landingData";

/* ==========================================================================
   ProblemSection — the situation Trellis is answering, stated plainly.
   ========================================================================== */

export default function ProblemSection() {
  return (
    <section id="problem" className="scroll-mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          {s.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{s.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {s.problems.map((item) => {
          const Glyph = Icon[item.icon] || Icon.AlertCircle;
          return (
            <div key={item.title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                <Glyph size={17} />
              </span>
              <h3 className="mt-4 font-display text-[15px] font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
