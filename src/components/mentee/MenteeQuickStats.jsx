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
      suffixColor: "#10b981", // emerald-500
    },
    {
      label: "Pending Tasks",
      value: pendingTasks.toString(),
      suffix: "still to do",
      suffixColor: "#64748b", // slate-500
    },
    {
      label: "Revision Requests",
      value: revisionRequests.toString(),
      suffix: "needs changes",
      suffixColor: revisionRequests > 0 ? "#ef4444" : "#64748b", // red-500 or slate-500
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7 animate-fade-in">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center min-w-[160px]"
        >
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
            {s.label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 leading-none">
              {s.value}
            </span>
            <span className="text-sm font-medium" style={{ color: s.suffixColor }}>
              {s.suffix}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
