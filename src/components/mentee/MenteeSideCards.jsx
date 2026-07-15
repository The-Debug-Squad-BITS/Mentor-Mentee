import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";
import Button from "../ui/Button";

export function RecentFeedbackCard() {
  const { menteeStats } = useDashboardStore();
  const feedbacks = menteeStats?.recentFeedback || [];

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col gap-5 shadow-sm animate-fade-in">
      <h2 className="m-0 text-base font-bold text-slate-900">
        Recent Advisor Feedback
      </h2>

      <div className="flex flex-col gap-3">
        {feedbacks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">
            No advisor feedback logged yet.
          </div>
        ) : (
          feedbacks.map((fb, idx) => {
            const taskTitle = fb.taskId?.title || fb.taskTitle || "Task Review";
            const feedbackText = fb.feedback || fb.content || fb.text || "No feedback text provided.";
            const dateStr = fb.reviewedAt || fb.updatedAt || fb.createdAt;
            const reviewerName = fb.reviewedBy?.name || fb.reviewedBy || fb.mentorName || "Advisor";

            return (
              <div
                key={fb._id || idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2 hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex justify-between items-center mb-1 gap-2">
                  <span className="text-sm font-semibold text-blue-600 truncate flex-1">
                    {taskTitle}
                  </span>
                  <span className="text-xs text-slate-500 font-medium shrink-0">
                    {dateStr ? new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}
                  </span>
                </div>
                <p className="m-0 text-sm text-slate-700 leading-relaxed italic">
                  "{feedbackText}"
                </p>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider self-end mt-1">
                  — {reviewerName}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function NotificationsCard() {
  const [notifications, setNotifications] = useState([]);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "1",
    name: "Emily Davies",
    role: "MENTEE"
  };

  const refreshNotifs = () => {
    // Stubbed until integrated with backend API
    setNotifications([]);
  };

  useEffect(() => {
    refreshNotifs();
  }, [currentUser.id]);

  const handleMarkAllRead = () => {
    // Stubbed until integrated with backend API
    refreshNotifs();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col gap-5 shadow-sm animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="m-0 text-base font-bold text-slate-900">
          Notifications Feed
        </h2>
        {unreadCount > 0 ? (
          <Button
            variant="ghost"
            onClick={handleMarkAllRead}
            className="text-xs py-1 px-2 text-blue-600 hover:text-blue-700"
          >
            Mark Read
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">All Read</span>
        )}
      </div>

      <div className="flex flex-col">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200 mt-1">
            No notifications inboxed.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="flex gap-3 py-3 border-b border-slate-100 last:border-0"
            >
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ background: !n.isRead ? "#2563eb" : "#cbd5e1" }}
              />
              <div className="min-w-0">
                <div
                  className="text-sm leading-snug mb-1"
                  style={{
                    color: !n.isRead ? "#0f172a" : "#475569",
                    fontWeight: !n.isRead ? 600 : 400,
                  }}
                >
                  {n.body}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {n.createdAt}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function UpcomingMilestonesCard() {
  const { menteeStats } = useDashboardStore();
  const milestones = menteeStats?.upcomingMilestones || [];

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col gap-5 shadow-sm animate-fade-in">
      <h2 className="m-0 text-base font-bold text-slate-900">
        Upcoming Milestones
      </h2>

      <div className="flex flex-col gap-3">
        {milestones.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">
            No upcoming milestones.
          </div>
        ) : (
          milestones.map((ms, idx) => (
            <div
              key={ms._id || idx}
              className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2 hover:bg-slate-100/50 transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm font-semibold text-slate-900 leading-snug">
                  {ms.title}
                </span>
                <span className="text-xs font-semibold uppercase shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    ms.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" :
                    ms.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                    ms.status === "OVERDUE" ? "bg-red-100 text-red-800" :
                    "bg-slate-100 text-slate-800"
                  }`}>
                    {ms.status?.replace("_", " ")}
                  </span>
                </span>
              </div>
              {ms.dueDate && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span>📅 Due:</span>
                  <span className="font-semibold">
                    {new Date(ms.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
