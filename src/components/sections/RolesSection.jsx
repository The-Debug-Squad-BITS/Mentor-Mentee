import { Icon } from "../ui/Icons";
import { rolesSection as s, roles } from "../../data/landingData";

/* ==========================================================================
   RolesSection — the same record of work, seen from four vantage points.
   ========================================================================== */

export default function RolesSection() {
  return (
    <section id="roles" className="scroll-mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          {s.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{s.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {roles.map((role) => {
          const Glyph = Icon[role.icon] || Icon.User;
          return (
            <div
              key={role.name}
              className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600">
                  <Glyph size={19} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[16px] font-bold text-slate-900">{role.name}</h3>
                  <p className="text-[13px] text-slate-500">{role.tagline}</p>
                </div>
              </div>

              <ul className="mt-5 flex flex-col gap-2.5 border-t border-slate-100 pt-5">
                {role.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-slate-600"
                  >
                    <Icon.Check size={16} className="mt-0.5 shrink-0 text-success-600" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
