import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";

export default function MentorOverview({ mentorStats, onNavigate }) {
  const { user } = useAuthStore();
  const currentUser = user || { name: "Mentor" };

  // Extract stats from API response (or default to 0)
  const assignedProjects = mentorStats?.assignedProjects ?? 0;
  const pendingReviews   = mentorStats?.pendingReviews   ?? 0;
  const assignedMentees  = mentorStats?.assignedMentees  ?? 0;
  const pendingMilestones = mentorStats?.pendingMilestones ?? 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="m-0 text-lg md:text-xl font-bold text-slate-900 tracking-tight">
          Welcome back, {currentUser.name} 👋
        </h2>
        <p className="m-0 mt-1 text-slate-500 text-sm">
          Here's a quick overview of your mentor dashboard.
        </p>
      </div>

      {/* Dynamic Advisor Stats Cards */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon="📁"
          label="My Projects"
          value={assignedProjects.toString()}
          badge="Assigned"
          badgeColor="blue"
        />
        <StatCard
          icon="⏳"
          label="Pending Reviews"
          value={pendingReviews.toString()}
          badge="Action Required"
          badgeColor="emerald"
        />
        <StatCard
          icon="👥"
          label="My Mentees"
          value={assignedMentees.toString()}
          badge="Team Size"
          badgeColor="purple"
        />
        <StatCard
          icon="🏁"
          label="Pending Milestones"
          value={pendingMilestones.toString()}
          badge="In Progress"
          badgeColor="amber"
        />
        <StatCard
          icon="💬"
          label="Unread Messages"
          value={(mentorStats?.unreadMessages ?? 0).toString()}
          badge="Chat"
          badgeColor="indigo"
          onClick={() => onNavigate("Messages")}
        />
      </div>

          {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <UpcomingMeetingsWidget meetings={mentorStats?.upcomingMeetings} onNavigate={onNavigate} />
        </div>

        {/* Right 1 Column: Quick Action Shortcuts */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-5 shadow-sm">
            <div>
              <h2 className="m-0 text-base font-bold text-slate-900">
                Quick Action Shortcuts
              </h2>
              <p className="m-0 mt-1 text-slate-500 text-sm">Shortcuts to manage deliverables and teams.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="secondary"
                onClick={() => onNavigate("Tasks")}
                className="w-full justify-start text-sm py-2.5 font-medium"
              >
                📝 Launch deliverables checklist
              </Button>
              <Button
                variant="secondary"
                onClick={() => onNavigate("Reviews")}
                className="w-full justify-start text-sm py-2.5 font-medium"
              >
                ⏳ Open submitted grading queue
              </Button>
              <Button
                variant="secondary"
                onClick={() => onNavigate("Team")}
                className="w-full justify-start text-sm py-2.5 font-medium"
              >
                👥 Search mentees workspace info
              </Button>
            </div>
          </div>
          
          {/* Recent Comments Feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-5 shadow-sm">
            <div>
              <h2 className="m-0 text-base font-bold text-slate-900">
                Recent Comments
              </h2>
              <p className="m-0 mt-1 text-slate-500 text-sm">Latest updates on your project tracks.</p>
            </div>
            
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
              {!mentorStats?.recentComments || mentorStats.recentComments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-lg border border-slate-200">
                  No recent comments.
                </div>
              ) : (
                mentorStats.recentComments.map((comment, idx) => (
                  <div key={comment._id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1.5 hover:bg-slate-100/50 transition-colors">
                    <p className="m-0 text-sm text-slate-800 leading-relaxed font-medium">
                      "{comment.content}"
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      <span>— {comment.authorId?.name || "Someone"}</span>
                      <span>{new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
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
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5 mt-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h2 className="m-0 text-base font-bold text-slate-900 flex items-center gap-2">
            <span>📅</span> Upcoming Meetings
          </h2>
          <p className="m-0 text-slate-500 text-xs mt-1">Scheduled video and audio syncs.</p>
        </div>
        {onNavigate && (
          <Button
            variant="ghost"
            onClick={() => onNavigate("Meetings")}
            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 px-2.5 py-1.5 rounded-lg border border-transparent font-semibold transition-all"
          >
            View All
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {!meetings || meetings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-lg border border-slate-200">
            No upcoming meetings scheduled.
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-xl gap-3 transition-colors"
            >
              <div className="flex gap-3 items-start min-w-0">
                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-blue-50 text-blue-600 font-semibold text-sm border border-blue-100 shadow-sm">
                  {meeting.type === "AUDIO" ? "🎙️" : "🎥"}
                </div>
                <div className="min-w-0">
                  <h3 className="m-0 text-sm font-bold text-slate-900 truncate">
                    {meeting.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">{formatWhen(meeting.scheduledAt)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{meeting.duration || 30} mins</span>
                    <span className="text-slate-300">•</span>
                    <span className="truncate">Host: {meeting.hostId?.name || "Unknown"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {meeting.meetingLink ? (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all no-underline inline-flex items-center gap-1"
                  >
                    <span>Join</span> ↗
                  </a>
                ) : (
                  <span className="px-2.5 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg">
                    No Link
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
