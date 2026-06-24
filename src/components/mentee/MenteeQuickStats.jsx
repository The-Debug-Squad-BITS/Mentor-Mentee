import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";
import api from "../../lib/api";

export default function MenteeQuickStats() {
  const { token } = useAuthStore();
  const { menteeStats, setMenteeStats } = useDashboardStore();

  // ── Fetch mentee dashboard stats from backend ──────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/mentee");
        // response.data.data:
        //   assignedTasks, completedTasks, pendingTasks, revisionRequests
        setMenteeStats(response.data.data);
      } catch (err) {
        console.error("Failed to fetch mentee dashboard stats:", err);
      }
    };
    if (token) fetchStats();
  }, [token, setMenteeStats]);

  const assignedTasks    = menteeStats?.assignedTasks    ?? 0;
  const completedTasks   = menteeStats?.completedTasks   ?? 0;
  const pendingTasks     = menteeStats?.pendingTasks      ?? 0;
  const revisionRequests = menteeStats?.revisionRequests ?? 0;

  const progressPercent =
    assignedTasks > 0
      ? Math.round((completedTasks / assignedTasks) * 100)
      : 0;

  const stats = [
    {
      label: "Overall Progress",
      value: `${progressPercent}%`,
      suffix: `${completedTasks} / ${assignedTasks} tasks done`,
      suffixColor: "#10b981",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks.toString(),
      suffix: "still to do",
      suffixColor: "#64748b",
    },
    {
      label: "Revision Requests",
      value: revisionRequests.toString(),
      suffix: "needs changes",
      suffixColor: revisionRequests > 0 ? "#ef4444" : "#64748b",
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
            <span className="text-xs font-bold" style={{ color: s.suffixColor }}>
              {s.suffix}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
