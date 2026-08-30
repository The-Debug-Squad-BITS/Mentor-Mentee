import { Icon } from "../ui/Icons";
import { whyTrellis as s } from "../../data/landingData";

/* ==========================================================================
   ProductComparisonSection — why a general tracker is the wrong shape for
   supervised academic work.

   Deliberately short and even-handed: it makes a structural argument about
   how supervision differs from sprinting, rather than claiming superiority.
   ========================================================================== */

export default function ProductComparisonSection() {
  return (
    <section id="why-trellis" className="scroll-mt-24">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          {/* The argument */}
          <div className="flex flex-col justify-between bg-ink-900 p-8 sm:p-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-400">
                {s.eyebrow}
              </p>
              <h2 className="mt-4 font-display text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[30px]">
                {s.title}
              </h2>
              <p className="mt-5 text-[14.5px] leading-relaxed text-slate-400">{s.subtitle}</p>
            </div>

            <p className="mt-8 border-t border-white/10 pt-6 text-[13px] leading-relaxed text-slate-500">
              {s.note}
            </p>
          </div>

          {/* What follows from it */}
          <div className="divide-y divide-slate-100">
            {s.points.map((point) => {
              const Glyph = Icon[point.icon] || Icon.Check;
              return (
                <div key={point.title} className="flex items-start gap-4 p-6 sm:p-7">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600">
                    <Glyph size={17} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-[15px] font-bold text-slate-900">{point.title}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">{point.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
