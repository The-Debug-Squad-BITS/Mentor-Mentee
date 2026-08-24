import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { Target, Clock, Refresh } from "../ui/Icons";
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
      suffixClass: "text-success-600",
      icon: Target,
      // Only the progress tile carries a bar — it is the one value with a scale.
      bar: progressPercent,
    },
    {
      label: "Pending Tasks",
      value: pendingTasks.toString(),
      suffix: "still to do",
      suffixClass: "text-slate-500",
      icon: Clock,
    },
    {
      label: "Revision Requests",
      value: revisionRequests.toString(),
      suffix: "needs changes",
      suffixClass: revisionRequests > 0 ? "text-danger-600" : "text-slate-500",
      icon: Refresh,
      alert: revisionRequests > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
      {stats.map((s) => {
        const Glyph = s.icon;
        return (
          <div
            key={s.label}
            className={`bg-white rounded-2xl border p-5 shadow-xs ${
              s.alert ? "border-danger-200" : "border-slate-200/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                  s.alert
                    ? "border-danger-100 bg-danger-50 text-danger-600"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <Glyph size={16} />
              </span>
              <span className="text-[13px] font-medium text-slate-500">{s.label}</span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-[30px] font-bold leading-none tracking-tight text-slate-900 tabular-nums">
                {s.value}
              </span>
              <span className={`text-[13px] font-medium ${s.suffixClass}`}>{s.suffix}</span>
            </div>

            {s.bar !== undefined && (
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-[width] duration-500 ease-out"
                  style={{ width: `${s.bar}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
