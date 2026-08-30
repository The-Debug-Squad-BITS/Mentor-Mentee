import { Icon } from "../ui/Icons";
import { faqSection as s, faqs } from "../../data/landingData";

/* ==========================================================================
   FaqSection — native <details> disclosures, so keyboard access, find-in-page
   and screen readers all work without any custom state or key handling.
   ========================================================================== */

export default function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          {s.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{s.subtitle}</p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {faqs.map((item) => (
          <details key={item.q} className="group border-b border-slate-100 last:border-b-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-slate-50/70 sm:px-6">
              <span className="font-display text-[14.5px] font-bold text-slate-900">{item.q}</span>
              <Icon.ChevronDown
                size={18}
                className="shrink-0 text-slate-400 transition-transform duration-200 group-open:-rotate-180"
              />
            </summary>
            <div className="px-5 pb-5 text-[13.5px] leading-relaxed text-slate-600 sm:px-6">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
