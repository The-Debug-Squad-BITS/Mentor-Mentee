import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";
import {
  Folder,
  Clock,
  Users,
  Flag,
  MessageSquare,
  Video,
  FileText,
  Search,
  ExternalLink,
  Calendar,
} from "../ui/Icons";

export default function MentorOverview({ mentorStats, onNavigate }) {
  const { user } = useAuthStore();
  const currentUser = user || { name: "Mentor" };

  // Extract stats from API response (or default to 0)
  const assignedProjects = mentorStats?.assignedProjects ?? 0;
  const pendingReviews   = mentorStats?.pendingReviews   ?? 0;
  const assignedMentees  = mentorStats?.assignedMentees  ?? 0;
  const pendingMilestones = mentorStats?.pendingMilestones ?? 0;

  const shortcuts = [
    { icon: FileText, label: "Deliverables checklist", nav: "Tasks" },
    { icon: Clock, label: "Submitted grading queue", nav: "Reviews" },
    { icon: Search, label: "Mentee workspace info", nav: "Team" },
  ];

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Welcome */}
      <div>
        <h2 className="page-title m-0">Welcome back, {currentUser.name}</h2>
        <p className="page-subtitle mt-1">
          Here&apos;s a quick overview of your mentor workspace.
        </p>
      </div>

      {/* Dynamic Advisor Stats Cards */}
      <div className="flex flex-wrap gap-4">
        <StatCard
          icon={<Folder size={17} />}
          label="My Projects"
          value={assignedProjects.toString()}
          badge="Assigned"
          badgeColor="blue"
        />
        <StatCard
          icon={<Clock size={17} />}
          label="Pending Reviews"
          value={pendingReviews.toString()}
          badge="Action Required"
          badgeColor="green"
        />
        <StatCard
          icon={<Users size={17} />}
          label="My Mentees"
          value={assignedMentees.toString()}
          badge="Team Size"
          badgeColor="purple"
        />
        <StatCard
          icon={<Flag size={17} />}
          label="Pending Milestones"
          value={pendingMilestones.toString()}
          badge="In Progress"
          badgeColor="amber"
        />
        <StatCard
          icon={<MessageSquare size={17} />}
          label="Unread Messages"
          value={(mentorStats?.unreadMessages ?? 0).toString()}
          badge="Chat"
          badgeColor="indigo"
          onClick={() => onNavigate("Messages")}
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        {/* Left 2 Columns */}
        <div className="flex min-w-0 flex-col gap-5 xl:col-span-2">
          <UpcomingMeetingsWidget meetings={mentorStats?.upcomingMeetings} onNavigate={onNavigate} />
        </div>

        {/* Right 1 Column: Quick Action Shortcuts */}
        <div className="flex min-w-0 flex-col gap-5">
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="section-title m-0">Quick Actions</h2>
                <p className="m-0 mt-0.5 text-[12.5px] text-slate-500">
                  Jump straight to what needs you.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {shortcuts.map(({ icon: Glyph, label, nav }) => (
                <Button
                  key={nav}
                  variant="secondary"
                  onClick={() => onNavigate(nav)}
                  className="w-full justify-start"
                >
                  <Glyph size={16} className="text-slate-400" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Comments Feed */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="section-title m-0">Recent Comments</h2>
                <p className="m-0 mt-0.5 text-[12.5px] text-slate-500">
                  Latest updates on your project tracks.
                </p>
              </div>
            </div>

            <div className="flex max-h-[300px] flex-col gap-2.5 overflow-y-auto p-4 scrollbar-slim">
              {!mentorStats?.recentComments || mentorStats.recentComments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-7 text-center text-[13px] text-slate-500">
                  No recent comments.
                </div>
              ) : (
                mentorStats.recentComments.map((comment, idx) => (
                  <div
                    key={comment._id || idx}
                    className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-colors duration-150 hover:bg-slate-50"
                  >
                    <p className="m-0 text-[13px] leading-relaxed text-slate-700">
                      &ldquo;{comment.content}&rdquo;
                    </p>
                    <div className="mt-0.5 flex items-center justify-between text-[11.5px] font-medium text-slate-500">
                      <span>— {comment.authorId?.name || "Someone"}</span>
                      <span>
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UpcomingMeetingsWidget({ meetings = [], onNavigate }) {
  const formatWhen = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    if (sameDay) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow, ${time}`;
    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${time}`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title m-0 flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            Upcoming Meetings
          </h2>
          <p className="m-0 mt-0.5 text-[12.5px] text-slate-500">
            Scheduled video and audio syncs.
          </p>
        </div>
        {onNavigate && (
          <Button variant="ghost" size="sm" onClick={() => onNavigate("Meetings")}>
            View All
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2.5 p-4">
        {!meetings || meetings.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Video size={22} />
            </span>
            <p className="empty-state-title">No meetings scheduled</p>
            <p className="empty-state-text">
              Meetings you or your mentees schedule will appear here with a join link.
            </p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4
                transition-colors duration-150 hover:bg-slate-50 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600">
                  {meeting.type === "AUDIO" ? <MessageSquare size={17} /> : <Video size={17} />}
                </span>
                <div className="min-w-0">
                  <h3 className="m-0 truncate text-[14px] font-semibold text-slate-900">
                    {meeting.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {formatWhen(meeting.scheduledAt)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{meeting.duration || 30} mins</span>
                    <span className="text-slate-300">•</span>
                    <span className="truncate">Host: {meeting.hostId?.name || "Unknown"}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                {meeting.meetingLink ? (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-success-600 px-3 py-2
                      text-[12.5px] font-semibold text-white no-underline shadow-xs
                      transition-colors duration-150 hover:bg-success-700"
                  >
                    Join <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="badge badge-neutral">No link</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
