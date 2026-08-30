import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { Icon, ArrowRight } from "../ui/Icons";
import { hero } from "../../data/landingData";

/* ==========================================================================
   HeroSection — the first screen. States what Trellis is, who it is for,
   and gives one primary and one secondary way in.
   ========================================================================== */

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto w-full max-w-3xl text-center">
      <p className="eyebrow">{hero.eyebrow}</p>

      <h1 className="mt-5 font-display text-[34px] font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-[44px] lg:text-[54px]">
        {hero.titleLead}
        <br className="hidden sm:block" />{" "}
        <span className="text-brand-600">{hero.titleAccent}</span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
        {hero.subtitle}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={() => navigate("/login")}>
          {hero.primaryCta} <ArrowRight size={16} />
        </Button>
        <Button variant="secondary" size="lg" onClick={() => navigate("/signup")}>
          {hero.secondaryCta}
        </Button>
      </div>

      {/* Assurances — what the product actually guarantees, not vanity metrics. */}
      <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {hero.assurances.map((item) => {
          const Glyph = Icon[item.icon] || Icon.Check;
          return (
            <li key={item.label} className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
              <Glyph size={16} className="text-brand-600" />
              {item.label}
            </li>
          );
        })}
      </ul>

      {/* Who it is for */}
      <div className="mt-10 border-t border-slate-200/80 pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {hero.trustLabel}
        </p>
        <ul className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {hero.trustRoles.map((role) => (
            <li
              key={role}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-700 shadow-xs"
            >
              {role}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
