import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";
import Button from "../ui/Button";
import {
  MessageSquare,
  Bell,
  Flag,
  Video,
  Clock,
  Calendar,
  User,
  ExternalLink,
} from "../ui/Icons";

/* ==========================================================================
   The five context cards in the mentee dashboard's right rail.
   --------------------------------------------------------------------------
   They previously repeated the same header/body/empty markup five times with
   small inconsistencies. `SideCard` and `EmptyRow` factor that out so the
   rail reads as one rhythm.
   ========================================================================== */

function SideCard({ icon: Glyph, title, action, children }) {
  return (
    <div className="card flex flex-col animate-fade-in">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-3.5">
        <h2 className="section-title m-0 flex items-center gap-2">
          <Glyph size={16} className="text-slate-400" />
          {title}
        </h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyRow({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-7 text-center text-[13px] text-slate-500">
      {children}
    </div>
  );
}

/** Shared list-item shell — a quiet tile with a title row and meta beneath. */
function Tile({ children }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-colors duration-150 hover:bg-slate-50">
      {children}
    </div>
  );
}

export function RecentFeedbackCard() {
  const { menteeStats } = useDashboardStore();
  const feedbacks = menteeStats?.recentFeedback || [];

  return (
    <SideCard icon={MessageSquare} title="Recent Advisor Feedback">
      <div className="flex flex-col gap-2.5">
        {feedbacks.length === 0 ? (
          <EmptyRow>No advisor feedback yet.</EmptyRow>
        ) : (
          feedbacks.map((fb, idx) => {
            const taskTitle = fb.taskId?.title || fb.taskTitle || "Task Review";
            const feedbackText = fb.feedback || fb.content || fb.text || "No feedback text provided.";
            const dateStr = fb.reviewedAt || fb.updatedAt || fb.createdAt;
            const reviewerName = fb.reviewedBy?.name || fb.mentorName || "Advisor";

            return (
              <Tile key={fb._id || idx}>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex-1 truncate text-[13px] font-semibold text-slate-900">
                    {taskTitle}
                  </span>
                  <span className="shrink-0 text-[11.5px] font-medium text-slate-500">
                    {dateStr
                      ? new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      : ""}
                  </span>
                </div>
                <p className="m-0 text-[13px] leading-relaxed text-slate-700">
                  &ldquo;{feedbackText}&rdquo;
                </p>
                <span className="self-end text-[11.5px] font-medium text-slate-500">
                  — {reviewerName}
                </span>
              </Tile>
            );
          })
        )}
      </div>
    </SideCard>
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
    <SideCard
      icon={Bell}
      title="Notifications"
      action={
        unreadCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            Mark Read
          </Button>
        ) : (
          <span className="text-[11.5px] font-medium text-slate-400">All read</span>
        )
      }
    >
      <div className="flex flex-col">
        {notifications.length === 0 ? (
          <EmptyRow>You&apos;re all caught up.</EmptyRow>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  !n.isRead ? "bg-brand-500" : "bg-slate-300"
                }`}
              />
              <div className="min-w-0">
                <div
                  className={`mb-1 text-[13px] leading-snug ${
                    !n.isRead ? "font-semibold text-slate-900" : "text-slate-600"
                  }`}
                >
                  {n.body}
                </div>
                <div className="text-[11.5px] font-medium text-slate-500">{n.createdAt}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </SideCard>
  );
}

export function UpcomingMilestonesCard() {
  const { menteeStats } = useDashboardStore();
  const milestones = menteeStats?.upcomingMilestones || [];

  return (
    <SideCard icon={Flag} title="Upcoming Milestones">
      <div className="flex flex-col gap-2.5">
        {milestones.length === 0 ? (
          <EmptyRow>No upcoming milestones.</EmptyRow>
        ) : (
          milestones.map((ms, idx) => (
            <Tile key={ms._id || idx}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-semibold leading-snug text-slate-900">
                  {ms.title}
                </span>
                <span
                  className={`badge shrink-0 ${
                    ms.status === "COMPLETED"
                      ? "badge-success"
                      : ms.status === "IN_PROGRESS"
                      ? "badge-info"
                      : ms.status === "OVERDUE"
                      ? "badge-danger"
                      : "badge-neutral"
                  }`}
                >
                  {ms.status?.replace("_", " ")}
                </span>
              </div>
              {ms.dueDate && (
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <Calendar size={13} className="text-slate-400" />
                  Due
                  <span className="font-semibold text-slate-700">
                    {new Date(ms.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </Tile>
          ))
        )}
      </div>
    </SideCard>
  );
}

export function UpcomingMeetingsCard({ onNavigate }) {
  const { menteeStats } = useDashboardStore();
  const meetings = menteeStats?.upcomingMeetings || [];

  return (
    <SideCard
      icon={Video}
      title="Upcoming Meetings"
      action={
        onNavigate && (
          <Button variant="ghost" size="sm" onClick={() => onNavigate("Meetings")}>
            View All
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-2.5">
        {meetings.length === 0 ? (
          <EmptyRow>No upcoming meetings.</EmptyRow>
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
              <Tile key={meeting._id || idx}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold leading-snug text-slate-900">
                    {meeting.title}
                  </span>
                  <span
                    className={`badge shrink-0 ${
                      meeting.type === "AUDIO" ? "badge-warning" : "badge-info"
                    }`}
                  >
                    {meeting.type || "VIDEO"}
                  </span>
                </div>

                <div className="mt-0.5 flex flex-wrap items-center justify-between gap-1 text-[12px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" />
                    {meeting.hostId?.name || "Advisor"}
                  </span>
                  <span className="font-semibold text-slate-700">{formatted}</span>
                </div>

                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg
                      bg-success-600 px-3 py-2 text-[12.5px] font-semibold text-white no-underline shadow-xs
                      transition-colors duration-150 hover:bg-success-700"
                  >
                    Join Call <ExternalLink size={13} />
                  </a>
                )}
              </Tile>
            );
          })
        )}
      </div>
    </SideCard>
  );
}

export function UpcomingDeadlinesCard({ onNavigate }) {
  const { menteeStats } = useDashboardStore();
  const deadlines = menteeStats?.upcomingDeadlines || [];

  return (
    <SideCard
      icon={Clock}
      title="Upcoming Deadlines"
      action={
        onNavigate && (
          <Button variant="ghost" size="sm" onClick={() => onNavigate("Calendar")}>
            Calendar
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-2.5">
        {deadlines.length === 0 ? (
          <EmptyRow>No upcoming deadlines.</EmptyRow>
        ) : (
          deadlines.map((dl, idx) => {
            const date = new Date(dl.startDate);
            const formatted = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const isMilestone = dl.eventType === "MILESTONE_DEADLINE";
            const badgeCls = isMilestone ? "badge-brand" : "badge-warning";

            return (
              <Tile key={dl._id || idx}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold leading-snug text-slate-900">
                    {dl.title}
                  </span>
                  <span className={`badge shrink-0 ${badgeCls}`}>
                    {isMilestone ? "Milestone" : "Task"}
                  </span>
                </div>

                <div className="mt-0.5 flex items-center justify-between text-[12px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    Due date
                  </span>
                  <span className="font-semibold text-slate-700">{formatted}</span>
                </div>
              </Tile>
            );
          })
        )}
      </div>
    </SideCard>
  );
}
