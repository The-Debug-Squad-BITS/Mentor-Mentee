export default function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background:
              value === 100
                ? "#10b981"
                : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          }}
        />
      </div>
      <span className="text-xs font-bold text-slate-500 w-8">{value}%</span>
    </div>
  );
}
