import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";

export default function MentorOverview({ mentorStats, onNavigate }) {
  const { user } = useAuthStore();
  const currentUser = user || { name: "Mentor" };

  // Extract stats from API response (or default to 0)
  const assignedProjects = mentorStats?.assignedProjects ?? 0;
  const pendingReviews = mentorStats?.pendingReviews ?? 0;
  const assignedMentees = mentorStats?.assignedMentees ?? 0;

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
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-5 shadow-sm">
            <div>
              <h2 className="m-0 text-base font-bold text-slate-900">
                Dashboard Summary
              </h2>
              <p className="m-0 mt-1 text-slate-500 text-sm">Your mentorship activity at a glance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 flex flex-col items-center justify-center">
                <span className="block text-3xl font-bold text-slate-900">{assignedProjects}</span>
                <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Projects</span>
              </div>
              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 flex flex-col items-center justify-center">
                <span className="block text-3xl font-bold text-slate-900">{pendingReviews}</span>
                <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Pending Reviews</span>
              </div>
              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 flex flex-col items-center justify-center">
                <span className="block text-3xl font-bold text-slate-900">{assignedMentees}</span>
                <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Mentees</span>
              </div>
            </div>
          </div>
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
        </div>
      </div>
    </div>
  );
}
