import { Inbox, Bell, FileText, Download, CheckCircle, Refresh, Mail } from "./Icons";
import { useState, useEffect, useRef } from "react";
import api from "../../lib/api";
import { useNotificationStore } from "../../store/notificationStore";
import { useAuthStore } from "../../store/authStore";
import { getSocket, connectSocket } from "../../lib/socket";
import { toast } from "react-toastify";

// Icon per notification type
const typeIcons = {
  TASK_ASSIGNED:       FileText,
  SUBMISSION_RECEIVED: Download,
  SUBMISSION_APPROVED: CheckCircle,
  REVISION_REQUESTED:  Refresh,
  INVITATION_SENT:     Mail,
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { token } = useAuthStore();
  const { notifications, setNotifications, markRead, unreadCount, setUnreadCount, prependNotification } = useNotificationStore();

  // ── Fetch on mount + poll every 30 seconds ─────────────────────────────
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        const list = response.data.data.notifications || [];
        setNotifications(list);
        // Backstop: seed the badge from REST so the unread count is correct even
        // if the socket's initial `notification_count` was missed (e.g. right
        // after a page refresh). Live socket events still override this.
        setUnreadCount(list.filter((n) => !n.isRead).length);
      } catch {
        /* silent fail — don't disrupt the user */
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30 sec
    return () => clearInterval(interval);
  }, [token, setNotifications, setUnreadCount]);

  // ── Socket Listeners ───────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    // On a fresh login the auth store has already opened the socket. On a page
    // refresh it may not exist yet (App's connect effect runs AFTER this child
    // effect), so ensure it here — connectSocket() is idempotent and reuses any
    // existing socket. Without this the listeners never register after a reload.
    const socket = getSocket() || connectSocket();
    if (!socket) return;

    const handleCount = ({ unreadCount }) => setUnreadCount(unreadCount);
    const handleNew = ({ notification }) => {
      prependNotification(notification);
      toast.info(notification.title);
    };

    socket.on('notification_count', handleCount);
    socket.on('new_notification', handleNew);

    return () => {
      socket.off('notification_count', handleCount);
      socket.off('new_notification', handleNew);
    };
  }, [token, setUnreadCount, prependNotification]);

  // ── Close dropdown on outside click ───────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Mark as read on click ──────────────────────────────────────────────
  const handleNotificationClick = async (notification) => {
    if (notification.isRead) return; // already read
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit('mark_notification_read', { notificationId: notification._id });
      } else {
        await api.patch(`/notifications/${notification._id}/read`);
      }
      markRead(notification._id); // optimistic update
    } catch {
      /* silent fail */
    }
  };

  const handleMarkAllRead = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('mark_all_read');
      // Optimistic update
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      setNotifications(updated);
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
        style={{ fontFamily: "inherit" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#475569"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Red badge for unread count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 leading-none shadow-sm ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-[999] overflow-hidden animate-fade-in"
        >
          {/* Dropdown header */}
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-sm font-bold text-slate-800">Notifications</span>
            {unreadCount > 0 && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-800 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
                <span className="text-[11px] font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full">
                  {unreadCount} unread
                </span>
              </div>
            )}
          </div>

          {/* List */}
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-5 py-10 text-center">
                <span className="empty-state-icon">
                  <Inbox size={20} />
                </span>
                <p className="empty-state-title">You are all caught up</p>
                <p className="empty-state-text">New activity on your work will show up here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-start gap-3.5 px-5 py-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${
                    !n.isRead ? "bg-brand-50/40" : ""
                  }`}
                >
                  {(() => {
                    const Glyph = typeIcons[n.type] || Bell;
                    return (
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                          !n.isRead
                            ? "border-brand-100 bg-brand-50 text-brand-600"
                            : "border-slate-200 bg-slate-50 text-slate-400"
                        }`}
                      >
                        <Glyph size={15} />
                      </span>
                    );
                  })()}

                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span
                      className={`text-[13px] leading-snug ${
                        !n.isRead
                          ? "font-bold text-slate-900"
                          : "font-semibold text-slate-600"
                      }`}
                    >
                      {n.title}
                    </span>
                    <span className="text-[12px] text-slate-500 font-medium leading-relaxed truncate">
                      {n.message}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5 shadow-sm" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
