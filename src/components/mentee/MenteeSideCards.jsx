import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";

export function RecentFeedbackCard() {
  const [feedbacks, setFeedbacks] = useState([]);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "1",
    name: "Emily Davies",
    role: "MENTEE"
  };

  useEffect(() => {
    // Stubbed until integrated with backend API
    setFeedbacks([]);
  }, [currentUser.id]);

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col gap-5 shadow-sm animate-fade-in">
      <h2 className="m-0 text-base font-bold text-slate-900">
        Recent Advisor Feedback
      </h2>

      <div className="flex flex-col gap-3">
        {feedbacks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">
            No advisor comments logged yet.
          </div>
        ) : (
          feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-blue-600 truncate max-w-[130px]">
                  {fb.task}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {fb.date}
                </span>
              </div>
              <p className="m-0 text-sm text-slate-700 leading-relaxed italic">
                "{fb.text}"
              </p>
              <span className="text-xs text-slate-500 font-medium self-end mt-1">
                — {fb.mentor}
              </span>
            </div>
          ))
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
