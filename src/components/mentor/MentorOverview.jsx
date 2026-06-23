import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import StatCard from "../ui/StatCard";
import { useAuthStore } from "../../store/authStore";

const statusStyle = {
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Completed: "bg-blue-100 text-blue-700",
  Archived: "bg-slate-100 text-slate-500",
};

export default function MentorOverview({ projects, onNavigate }) {
  const [tasksAwaitingReview, setTasksAwaitingReview] = useState([]);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [allTasksCount, setAllTasksCount] = useState(0);
  
  const { user } = useAuthStore();
  const currentUser = user || {
    id: "2",
    name: "Sarah Connor",
    role: "MENTOR"
  };

  useEffect(() => {
    // Stubbed until integrated with backend API
    setAllTasksCount(0);
    setTasksAwaitingReview([]);
    setCompletedTasksCount(0);
  }, [currentUser.id]);

  // Extract real active assigned mentees count
  const addedMenteeIds = new Set();
  projects.forEach((p) => {
    if (p.mentees) {
      p.mentees.forEach((m) => {
        addedMenteeIds.add(m.id);
      });
    }
  });
  const activeMenteesCount = addedMenteeIds.size;

  return (
    <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">
      {/* Dynamic Advisor Stats Cards */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon="👥"
          label="Active Mentees"
          value={activeMenteesCount.toString()}
          badge="Workspace Team"
          badgeColor="blue"
        />
        <StatCard
          icon="📁"
          label="My Projects"
          value={projects.length.toString()}
          badge="Advisor Tracks"
          badgeColor="green"
        />
        <StatCard
          icon="⏳"
          label="Awaiting Review"
          value={tasksAwaitingReview.length.toString()}
          badge="Action Required"
          badgeColor="blue"
        />
        <StatCard
          icon="✓"
          label="Milestones Cleared"
          value={`${allTasksCount > 0 ? Math.round((completedTasksCount / allTasksCount) * 100) : 0}%`}
          badge="Overall progress"
          badgeColor="green"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Assigned Projects Summary */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
            <div>
              <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
                Supervised Projects in Progress
              </h2>
              <p className="m-0 mt-0.5 text-slate-400 text-[11px] font-semibold">List of academic track workspaces assigned by admin.</p>
            </div>

            {projects.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-2xl border border-slate-100">
                No active projects assigned yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl flex justify-between items-center flex-wrap gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="block font-black text-slate-800 text-xs md:text-sm truncate">{p.name}</span>
                      <span className="block text-[11px] text-slate-400 font-semibold mt-0.5 uppercase">Mentor Lead: Sarah Connor</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-28 sm:w-36">
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-1">
                          <span>PROGRESS</span>
                          <span>{p.progress}%</span>
                        </div>
                        <ProgressBar value={p.progress} />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${statusStyle[p.status] || statusStyle.Active}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Quick Action Shortcuts & Awaiting Review */}
        <div className="flex flex-col gap-6">
          {/* Quick Action Shortcuts */}
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

          {/* Tasks Awaiting Review Queue */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
            <div>
              <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
                Awaiting Grading Review ({tasksAwaitingReview.length})
              </h2>
              <p className="m-0 mt-0.5 text-slate-400 text-[11px] font-semibold">Tasks awaiting constructive comments.</p>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {tasksAwaitingReview.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs font-semibold">All submissions successfully graded.</div>
              ) : (
                tasksAwaitingReview.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate("Reviews")}
                    className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-indigo-50/10 cursor-pointer transition-colors flex justify-between items-center"
                  >
                    <div className="min-w-0">
                      <span className="block font-bold text-slate-700 text-xs truncate max-w-[130px]">{t.title}</span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">{t.assigneeName}</span>
                    </div>
                    <span className="text-[9px] font-extrabold text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase shrink-0">Under Review</span>
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
