import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import Button from "../ui/Button";
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
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-lg font-bold text-slate-900">
          Assigned Projects
        </h2>
        <Button variant="ghost" onClick={onViewAll} className="text-sm px-3 py-1.5 text-blue-600 hover:text-blue-700">
          View All
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {myProjects.length === 0 ? (
          <div className="text-center py-6 text-slate-500 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-sm font-medium">No projects assigned by Admin yet.</span>
          </div>
        ) : (
          myProjects.map((p) => {
            const mentor = p.mentor || { name: "Unassigned", avatar: "UA", color: "#64748b" };
            return (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6
                  p-5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                {/* Name + Mentor */}
                <div className="flex-1 min-w-0">
                  <h3 className="m-0 mb-1.5 text-base font-semibold text-slate-900 truncate">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Avatar initials={mentor.avatar || mentor.name.substring(0, 2).toUpperCase()} color={mentor.color} size={20} />
                    Mentor: <strong className="text-slate-800 font-medium">{mentor.name}</strong>
                  </div>
                </div>

                {/* Progress */}
                <div className="w-full sm:w-32 lg:w-40">
                  <div className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">
                    Progress
                  </div>
                  <ProgressBar value={p.progress} />
                </div>

                {/* Deadline */}
                <div className="w-full sm:w-32 lg:w-36 sm:text-right">
                  <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">
                    Next Deadline
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
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
