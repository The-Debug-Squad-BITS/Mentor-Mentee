import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import { useAuthStore } from "../../store/authStore";

export default function AssignedProjectsCard({ onViewAll }) {
  const { user } = useAuthStore();
  const currentUser = user || {
    id: "1",
    name: "Emily Davies",
    role: "MENTEE"
  };

  // Fetch real assigned projects for this Mentee
  const myProjects = [];

  return (
    <div
      className="bg-white rounded-2xl p-4 md:p-5 lg:p-7 border border-slate-100"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.02)" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 md:mb-5">
        <h2 className="m-0 text-base md:text-lg lg:text-xl font-black text-slate-800">
          Assigned Projects
        </h2>
        <button
          onClick={onViewAll}
          className="bg-transparent border-0 text-indigo-500 text-[11px] md:text-xs lg:text-sm font-bold cursor-pointer hover:text-indigo-700 transition-colors"
          style={{ fontFamily: "inherit" }}
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        {myProjects.length === 0 ? (
          <div className="text-center py-6 text-slate-400 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-xs font-semibold">No projects assigned by Admin yet.</span>
          </div>
        ) : (
          myProjects.map((p) => {
            const mentor = p.mentor || { name: "Unassigned", avatar: "UA", color: "#64748b" };
            return (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 lg:gap-5
                  p-3 md:p-4 border border-slate-100 rounded-xl md:rounded-2xl bg-slate-50"
              >
                {/* Name + Mentor */}
                <div className="flex-1 min-w-0">
                  <h3 className="m-0 mb-1 md:mb-1.5 text-xs md:text-sm lg:text-base font-bold text-slate-800 truncate">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs text-slate-500 font-semibold">
                    <Avatar initials={mentor.avatar || mentor.name.substring(0, 2).toUpperCase()} color={mentor.color} size={18} />
                    Mentor: <strong className="text-slate-600">{mentor.name}</strong>
                  </div>
                </div>

                {/* Progress */}
                <div className="w-full sm:w-28 md:w-32 lg:w-36">
                  <div className="text-[10px] md:text-xs text-slate-500 mb-1 md:mb-1.5 font-semibold">
                    Progress
                  </div>
                  <ProgressBar value={p.progress} />
                </div>

                {/* Deadline */}
                <div className="w-full sm:w-28 md:w-32 lg:w-36 sm:text-right">
                  <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1 font-semibold">
                    Next Deadline
                  </div>
                  <div className="text-[11px] md:text-xs lg:text-sm font-bold text-slate-800">
                    Next week, 5:00 PM
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
