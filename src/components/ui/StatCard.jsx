/* ==========================================================================
   StatCard — a single headline metric.
   --------------------------------------------------------------------------
   Props are unchanged: { icon, label, value, badge, badgeColor, onClick }.
   `badgeColor` still accepts green | blue | purple | amber | red | indigo.

   Layout intent: the number is the hero. Label sits above it as quiet
   context, the icon anchors the top-left, and the badge carries delta or
   status information at the top-right.
   ========================================================================== */

const badgeStyles = {
  green:  "bg-success-50 text-success-700 border-success-200",
  blue:   "bg-info-50    text-info-700    border-info-200",
  purple: "bg-violet-50  text-violet-700  border-violet-200",
  amber:  "bg-warning-50 text-warning-700 border-warning-200",
  red:    "bg-danger-50  text-danger-700  border-danger-200",
  indigo: "bg-brand-50   text-brand-700   border-brand-200",
};

export default function StatCard({ icon, label, value, badge, badgeColor, onClick }) {
  const interactive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={`group bg-white border border-slate-200/80 rounded-2xl shadow-xs
        p-5 flex-1 min-w-40
        transition-[box-shadow,border-color] duration-200
        ${interactive
          ? "cursor-pointer select-none hover:shadow-md hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 border border-slate-200/70
            text-slate-600 flex items-center justify-center text-[17px]
            transition-colors duration-200 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-100"
        >
          {icon}
        </div>

        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap
              ${badgeStyles[badgeColor] || badgeStyles.indigo}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="text-[13px] font-medium text-slate-500">{label}</div>
        <div className="font-display text-[28px] font-bold text-slate-900 leading-tight tracking-tight mt-0.5 tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}
