import { Icon } from "../ui/Icons";
import { roadmapSection as s, roadmap } from "../../data/landingData";

/* ==========================================================================
   RoadmapSection — where Trellis is today and where it is going.

   The honesty of this section matters more than its polish: Phase 1 is a
   shipped product, Phases 2 and 3 are intent. Each card carries an explicit
   status chip, the two future phases are visually quieter than the delivered
   one, and a closing line states plainly that nothing in them exists yet.
   A visitor should not be able to mistake the roadmap for a feature list.
   ========================================================================== */

/* Delivered work earns full contrast; planned work is deliberately calmer. */
const TONE = {
  delivered: {
    card: "border-brand-200 bg-white ring-1 ring-brand-100",
    chip: "bg-brand-50 text-brand-700 ring-1 ring-brand-200",
    badge: "bg-ink-900 text-white",
    phase: "text-brand-600",
    dot: "bg-brand-500",
  },
  planned: {
    card: "border-slate-200/80 bg-white",
    chip: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    badge: "bg-slate-100 text-slate-500",
    phase: "text-slate-400",
    dot: "bg-slate-300",
  },
  future: {
    card: "border-slate-200/70 bg-slate-50/60",
    chip: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    badge: "bg-slate-100 text-slate-500",
    phase: "text-slate-400",
    dot: "bg-slate-300",
  },
};

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="scroll-mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          {s.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{s.subtitle}</p>
      </div>

      <ol className="mt-10 grid gap-5 lg:grid-cols-3">
        {roadmap.map((item) => {
          const Glyph = Icon[item.icon] || Icon.Check;
          const tone = TONE[item.status] || TONE.planned;

          return (
            <li
              key={item.phase}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-xs ${tone.card}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.badge}`}
                >
                  <Glyph size={17} />
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.09em] ${tone.chip}`}
                >
                  {item.statusLabel}
                </span>
              </div>

              <p
                className={`mt-5 font-display text-[11px] font-bold uppercase tracking-[0.12em] ${tone.phase}`}
              >
                {item.phase}
              </p>
              <h3 className="mt-1.5 font-display text-[17px] font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-600">{item.summary}</p>

              <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-600">
                    <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      {/* Stated plainly rather than buried in small print. */}
      <p className="mt-6 text-center text-[13px] leading-relaxed text-slate-500">
        Phase 1 is available today. Phases 2 and 3 describe the intended direction of
        the product — they are not current functionality.
      </p>
    </section>
  );
}
