import StatCard from "../ui/StatCard";
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
      <div className="bg-white rounded-3xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <h2 className="m-0 text-base md:text-lg font-black text-slate-800">
          Welcome back, {currentUser.name} 👋
        </h2>
        <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">
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
          badgeColor="green"
        />
        <StatCard
          icon="⏳"
          label="Pending Reviews"
          value={pendingReviews.toString()}
          badge="Action Required"
          badgeColor="blue"
        />
        <StatCard
          icon="👥"
          label="My Mentees"
          value={assignedMentees.toString()}
          badge="Team Size"
          badgeColor="blue"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
            <div>
              <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
                Dashboard Summary
              </h2>
              <p className="m-0 mt-0.5 text-slate-400 text-[11px] font-semibold">Your mentorship activity at a glance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-center">
                <span className="block text-2xl font-black text-indigo-600">{assignedProjects}</span>
                <span className="block text-[11px] text-slate-400 font-bold uppercase mt-1">Projects</span>
              </div>
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-center">
                <span className="block text-2xl font-black text-amber-500">{pendingReviews}</span>
                <span className="block text-[11px] text-slate-400 font-bold uppercase mt-1">Pending Reviews</span>
              </div>
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-center">
                <span className="block text-2xl font-black text-cyan-600">{assignedMentees}</span>
                <span className="block text-[11px] text-slate-400 font-bold uppercase mt-1">Mentees</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Quick Action Shortcuts */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
            <div>
              <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
                Quick Action Shortcuts
              </h2>
              <p className="m-0 mt-0.5 text-slate-400 text-[11px] font-semibold">Shortcuts to manage deliverables and teams.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onNavigate("Tasks")}
                className="w-full text-left bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold border-none px-4 py-3 rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-2"
                style={{ fontFamily: "inherit" }}
              >
                📝 Launch deliverables checklist
              </button>
              <button
                onClick={() => onNavigate("Reviews")}
                className="w-full text-left bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold border-none px-4 py-3 rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-2"
                style={{ fontFamily: "inherit" }}
              >
                ⏳ Open submitted grading queue
              </button>
              <button
                onClick={() => onNavigate("Team")}
                className="w-full text-left bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold border-none px-4 py-3 rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-2"
                style={{ fontFamily: "inherit" }}
              >
                👥 Search mentees workspace info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
