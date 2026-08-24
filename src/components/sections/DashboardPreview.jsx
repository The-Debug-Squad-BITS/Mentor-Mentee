import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { Icon, Logo, ArrowRight } from "../ui/Icons";
import { productPreview as p } from "../../data/landingData";

/* ==========================================================================
   DashboardPreview — a hand-built mock of the administrator workspace.
   --------------------------------------------------------------------------
   Rendered entirely in markup rather than as a screenshot so it stays sharp
   at any density and never drifts out of date with the real UI. It mirrors
   the actual admin dashboard: ink sidebar, stat row, project list and a
   review queue.
   ========================================================================== */

const statusTone = {
  "On Track": "bg-success-50 text-success-700 border-success-200",
  "Awaiting Review": "bg-warning-50 text-warning-700 border-warning-200",
  "Needs Help": "bg-brand-50 text-brand-700 border-brand-200",
  "Under Review": "bg-warning-50 text-warning-700 border-warning-200",
  "Revision Needed": "bg-danger-50 text-danger-700 border-danger-200",
  Completed: "bg-success-50 text-success-700 border-success-200",
};

function Pill({ children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap ${
        statusTone[children] || "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      <span className="h-1 w-1 shrink-0 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

export default function DashboardPreview() {
  const navigate = useNavigate();

  return (
    <section id="product" className="scroll-mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{p.eyebrow}</p>
        <h2 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          {p.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{p.subtitle}</p>
      </div>

      {/* ── The mock ─────────────────────────────────────────────────────── */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex min-h-[520px]">
          {/* Sidebar */}
          <aside className="hidden w-52 shrink-0 flex-col bg-ink-900 p-3 md:flex">
            <div className="flex items-center gap-2.5 px-2 py-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Logo size={16} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-[14px] font-bold text-white">
                  {p.workspaceLabel}
                </span>
                <span className="block truncate text-[10.5px] text-slate-500">{p.workspaceMeta}</span>
              </span>
            </div>

            <nav className="mt-4 flex flex-col gap-0.5">
              {p.nav.map((item) => {
                const Glyph = Icon[item.icon] || Icon.Folder;
                return (
                  <span
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium ${
                      item.active ? "bg-brand-500/15 text-white" : "text-slate-400"
                    }`}
                  >
                    <Glyph size={15} />
                    {item.label}
                  </span>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1 bg-canvas">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate font-display text-[15px] font-bold text-slate-900">{p.screenTitle}</p>
                <p className="truncate text-[12px] text-slate-500">{p.screenSubtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-400 sm:flex">
                  <Icon.Search size={14} /> Search
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
                  <Icon.Bell size={14} />
                </span>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {/* Stat row */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {p.stats.map((s) => {
                  const Glyph = Icon[s.icon] || Icon.BarChart;
                  return (
                    <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                        <Glyph size={14} />
                      </span>
                      <p className="mt-2.5 text-[11.5px] font-medium text-slate-500">{s.label}</p>
                      <p className="font-display text-[20px] font-bold leading-tight tracking-tight text-slate-900 tabular-nums">
                        {s.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
                {/* Projects */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="border-b border-slate-200/70 px-4 py-3">
                    <p className="font-display text-[13px] font-bold text-slate-900">{p.projectsTitle}</p>
                  </div>
                  <ul>
                    {p.projects.map((proj) => (
                      <li
                        key={proj.name}
                        className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-[10px] font-semibold text-white">
                          {proj.initials}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-semibold text-slate-800">
                            {proj.name}
                          </span>
                          <span className="block truncate text-[11px] text-slate-500">{proj.mentor}</span>
                        </span>
                        <span className="hidden w-20 shrink-0 sm:block">
                          <span className="block h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <span
                              className="block h-full rounded-full bg-brand-500"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </span>
                        </span>
                        <Pill>{proj.status}</Pill>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Review queue */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="border-b border-slate-200/70 px-4 py-3">
                    <p className="font-display text-[13px] font-bold text-slate-900">{p.queueTitle}</p>
                  </div>
                  <ul>
                    {p.queue.map((q) => (
                      <li key={q.task} className="border-b border-slate-100 px-4 py-3 last:border-b-0">
                        <p className="truncate text-[12.5px] font-semibold text-slate-800">{q.task}</p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {q.who} · {q.when}
                        </p>
                        <span className="mt-2 inline-block">
                          <Pill>{q.state}</Pill>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-slate-500">{p.caption}</p>
        <Button variant="secondary" size="sm" onClick={() => navigate("/login")}>
          {p.cta} <ArrowRight size={15} />
        </Button>
      </div>
    </section>
  );
}
