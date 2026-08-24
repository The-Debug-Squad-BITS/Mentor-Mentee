import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import Button from "../ui/Button";
import { Folder, ArrowRight } from "../ui/Icons";
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
    <div className="card">
      <div className="card-header">
        <h2 className="section-title m-0">Assigned Projects</h2>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All <ArrowRight size={15} />
        </Button>
      </div>

      {myProjects.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">
            <Folder size={22} />
          </span>
          <p className="empty-state-title">No projects assigned yet</p>
          <p className="empty-state-text">
            Once an administrator assigns you to a project, it will show up here along with
            your mentor and your progress.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-5">
          {myProjects.map((p) => {
            const mentor = p.mentor || { name: "Unassigned", avatar: "UA", color: "#64748b" };
            return (
              <div
                key={p.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4
                  transition-colors duration-150 hover:bg-slate-50 sm:flex-row sm:items-center lg:gap-6"
              >
                {/* Name + Mentor */}
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 mb-1.5 truncate text-[15px] font-semibold text-slate-900">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[13px] text-slate-600">
                    <Avatar
                      initials={mentor.avatar || mentor.name.substring(0, 2).toUpperCase()}
                      color={mentor.color}
                      size={20}
                    />
                    Mentor: <strong className="font-semibold text-slate-800">{mentor.name}</strong>
                  </div>
                </div>

                {/* Progress */}
                <div className="w-full sm:w-32 lg:w-40">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Progress
                  </div>
                  <ProgressBar value={p.progress} />
                </div>

                {/* Deadline */}
                <div className="w-full sm:w-32 sm:text-right lg:w-36">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Next Deadline
                  </div>
                  <div className="text-[13px] font-semibold text-slate-900">
                    Next week, 5:00 PM
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
