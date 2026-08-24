import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import { Folder } from "../ui/Icons";
import { useAuthStore } from "../../store/authStore";

export default function MenteeProjects() {
  const [projects, setProjects] = useState([]);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "1",
    name: "Emily Davies",
    role: "MENTEE"
  };

  useEffect(() => {
    // Stubbed until integrated with backend API
    setProjects([]);
  }, [currentUser.id]);

  const getProjTaskCount = (projectId) => {
    return 0;
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title m-0">My Assigned Projects</h1>
        <p className="page-subtitle mt-1">
          Oversee workspaces assigned to you by administrators.
        </p>
      </div>

      {/* Grid listing */}
      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">
              <Folder size={22} />
            </span>
            <p className="empty-state-title">No projects assigned yet</p>
            <p className="empty-state-text">
              When an administrator adds you to a project, it will appear here with your
              advisor and current progress.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(p => (
            <div key={p.id} className="card-interactive flex flex-col justify-between gap-5 p-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="m-0 min-w-0 flex-1 truncate font-display text-[15px] font-bold tracking-tight text-slate-900">
                    {p.name}
                  </h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="m-0 line-clamp-2 text-[13.5px] leading-relaxed text-slate-600">
                  {p.description || "Workspace tracking console."}
                </p>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
                {/* Lead Advisor Info */}
                <div>
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Lead Advisor
                  </span>
                  {p.mentor ? (
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={p.mentor.avatar} color={p.mentor.color} size={32} />
                      <div className="min-w-0">
                        <span className="block truncate text-[13.5px] font-semibold text-slate-900">
                          {p.mentor.name}
                        </span>
                        <span className="block text-[12px] text-slate-500">Supervisor</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[13px] italic text-slate-500">Unassigned</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-500">Tasks Created</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {getProjTaskCount(p.id)} tasks
                  </span>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-[13px]">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
