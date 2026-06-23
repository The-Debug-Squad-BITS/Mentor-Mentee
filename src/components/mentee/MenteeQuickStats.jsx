import { useAuthStore } from "../../store/authStore";

export default function MenteeQuickStats() {
  const { user } = useAuthStore();
  const currentUser = user || {
    id: "1",
    name: "Emily Davies",
    role: "MENTEE"
  };

  const tasks = [];
  const totalCount = 0;
  const completedCount = 0;
  const rejectedCount = 0;
  const progressPercent = 0;

  const stats = [
    {
      label: "Overall Progress",
      value: `${progressPercent}%`,
      suffix: `Target Track`,
      suffixColor: "#10b981",
    },
    {
      label: "Tasks Completed",
      value: completedCount.toString(),
      suffix: `/ ${totalCount} assigned`,
      suffixColor: "#64748b",
    },
    {
      label: "Revision Requests",
      value: rejectedCount.toString(),
      suffix: `Needs changes`,
      suffixColor: rejectedCount > 0 ? "#ef4444" : "#64748b",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7 animate-fade-in">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white p-5 rounded-2xl border border-slate-100 flex-1 min-w-40"
          style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.03)" }}
        >
          <div className="text-[10px] md:text-[11px] lg:text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
            {s.label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] md:text-[32px] lg:text-3xl font-black text-slate-800 leading-none">
              {s.value}
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: s.suffixColor }}
            >
              {s.suffix}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
