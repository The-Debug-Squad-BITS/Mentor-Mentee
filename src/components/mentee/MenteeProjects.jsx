import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
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
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">My Assigned Projects</h1>
        <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Oversee workspaces assigned to you by administrators.</p>
      </div>

      {/* Grid listing */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center text-slate-400 text-xs font-semibold">
          No projects assigned to your student track yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div
              key={p.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 duration-300"
              style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h3 className="m-0 text-sm md:text-base font-black text-slate-800 tracking-tight max-w-[150px] truncate">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="m-0 text-[11px] text-slate-400 font-semibold line-clamp-2">
                  {p.description || "Workspace tracking console."}
                </p>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-50 pt-4">
                {/* Lead Advisor Info */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Lead Advisor</span>
                  {p.mentor ? (
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={p.mentor.avatar} color={p.mentor.color} size={28} />
                      <div className="min-w-0">
                        <span className="block font-black text-slate-700 text-xs truncate">{p.mentor.name}</span>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">Supervisor</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>TASKS CREATED:</span>
                  <span className="font-extrabold text-slate-700">{getProjTaskCount(p.id)} tasks</span>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                    <span>PROGRESS</span>
                    <span>{p.progress}%</span>
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
