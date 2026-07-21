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
            const reviewerName = fb.reviewedBy?.name || fb.mentorName || "Advisor";

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

export function UpcomingMeetingsCard({ onNavigate }) {
  const { menteeStats } = useDashboardStore();
  const meetings = menteeStats?.upcomingMeetings || [];

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col gap-5 shadow-sm animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h2 className="m-0 text-base font-bold text-slate-900 flex items-center gap-2">
          <span>📅</span> Upcoming Meetings
        </h2>
        {onNavigate && (
          <Button
            variant="ghost"
            onClick={() => onNavigate("Meetings")}
            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 px-2 py-1 rounded"
          >
            View All
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {meetings.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">
            No upcoming meetings.
          </div>
        ) : (
          meetings.map((meeting, idx) => {
            const date = new Date(meeting.scheduledAt);
            const formatted = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            return (
              <div
                key={meeting._id || idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2 hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-semibold text-slate-900 leading-snug">
                    {meeting.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                    meeting.type === "AUDIO" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {meeting.type || "VIDEO"}
                  </span>
                </div>
                
                <div className="flex flex-wrap justify-between items-center text-xs text-slate-550 gap-1 mt-1">
                  <span>👤 Host: {meeting.hostId?.name || "Advisor"}</span>
                  <span className="font-semibold text-slate-700">{formatted}</span>
                </div>

                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-center w-full px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all no-underline inline-block"
                  >
                    Join Call ↗
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function UpcomingDeadlinesCard({ onNavigate }) {
  const { menteeStats } = useDashboardStore();
  const deadlines = menteeStats?.upcomingDeadlines || [];

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col gap-5 shadow-sm animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h2 className="m-0 text-base font-bold text-slate-900 flex items-center gap-2">
          <span>⏰</span> Upcoming Deadlines
        </h2>
        {onNavigate && (
          <Button
            variant="ghost"
            onClick={() => onNavigate("Calendar")}
            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 px-2 py-1 rounded"
          >
            Calendar
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {deadlines.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">
            No upcoming deadlines.
          </div>
        ) : (
          deadlines.map((dl, idx) => {
            const date = new Date(dl.startDate);
            const formatted = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const isMilestone = dl.eventType === "MILESTONE_DEADLINE";
            const badgeCls = isMilestone ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800";
            
            return (
              <div
                key={dl._id || idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2 hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-semibold text-slate-900 leading-snug">
                    {dl.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${badgeCls}`}>
                    {isMilestone ? "Milestone" : "Task"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-550 mt-1">
                  <span>📅 Due Date:</span>
                  <span className="font-semibold text-slate-700">{formatted}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
