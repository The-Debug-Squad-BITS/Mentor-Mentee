/* ==========================================================================
   ProgressBar — completion of a task, milestone or project.
   --------------------------------------------------------------------------
   Prop unchanged: { value } (0–100).

   The fill is a flat brand tone rather than a gradient — at 6px tall a
   gradient reads as noise. Completion switches to the success tone so "done"
   is legible at a glance without reading the number.
   ========================================================================== */

export default function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const done = pct >= 100;

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${
            done ? "bg-success-500" : "bg-brand-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-[12px] font-semibold tabular-nums w-9 ${
          done ? "text-success-600" : "text-slate-500"
        }`}
      >
        {pct}%
      </span>
    </div>
  );
}
