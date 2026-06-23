import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

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
    <div
      className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col gap-4 animate-fade-in"
      style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.03)" }}
    >
      <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
        Recent Advisor Feedback
      </h2>

      <div className="flex flex-col gap-3">
        {feedbacks.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-xl border border-slate-100">
            No advisor comments logged yet.
          </div>
        ) : (
          feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1.5"
            >
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-extrabold text-indigo-500 truncate max-w-[130px]">
                  {fb.task}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {fb.date}
                </span>
              </div>
              <p className="m-0 text-[11px] md:text-xs text-slate-600 leading-relaxed italic">
                "{fb.text}"
              </p>
              <span className="text-[10px] text-slate-400 font-bold self-end mt-1">
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
    <div
      className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col gap-4 animate-fade-in"
      style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.03)" }}
    >
      <div className="flex justify-between items-center">
        <h2 className="m-0 text-sm md:text-base font-black text-slate-800 font-sans">
          Notifications Feed
        </h2>
        {unreadCount > 0 ? (
          <button
            onClick={handleMarkAllRead}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-lg text-[9px] font-black border-none cursor-pointer transition-colors uppercase tracking-wider"
          >
            Mark Read
          </button>
        ) : (
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">All Read</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-xl border border-slate-100">
            No notifications inboxed.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="flex gap-2.5 py-2.5 border-b border-slate-50 last:border-0"
            >
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ background: !n.isRead ? "#6366f1" : "#cbd5e1" }}
              />
              <div className="min-w-0">
                <div
                  className="text-xs leading-relaxed mb-0.5 truncate max-w-[200px]"
                  style={{
                    color: !n.isRead ? "#1e293b" : "#64748b",
                    fontWeight: !n.isRead ? 700 : 500,
                  }}
                >
                  {n.body}
                </div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">
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
