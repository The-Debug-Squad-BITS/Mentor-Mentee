import { Icon } from "../ui/Icons";
import { featuresSection as s, features } from "../../data/landingData";

/* ==========================================================================
   FeaturesSection — what the product actually does. Every entry maps to a
   real screen; nothing here is aspirational.
   ========================================================================== */

export default function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          {s.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{s.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Glyph = Icon[f.icon] || Icon.Sparkle;
          return (
            <div key={f.title} className="group bg-white p-6 transition-colors duration-200 hover:bg-slate-50/70">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600">
                <Glyph size={17} />
              </span>
              <h3 className="mt-4 font-display text-[15px] font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
