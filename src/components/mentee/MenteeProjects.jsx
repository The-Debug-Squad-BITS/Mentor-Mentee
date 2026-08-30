import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import { Folder } from "../ui/Icons";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
import { avatarColor } from "../../lib/avatarColor";

/* Mirrors the project card's layout so the swap to real content doesn't jump. */
function ProjectCardSkeleton() {
  return (
    <div className="card flex flex-col justify-between gap-5 p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="skeleton h-4 w-1/2" />
          <span className="skeleton h-5 w-16 rounded-full" />
        </div>
        <span className="skeleton h-3 w-full" />
        <span className="skeleton h-3 w-4/5" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="skeleton h-1.5 w-full rounded-full" />
        <div className="flex items-center gap-2">
          <span className="skeleton h-7 w-7 rounded-full" />
          <span className="skeleton h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export default function MenteeProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "1",
    name: "Emily Davies",
    role: "MENTEE"
  };

  useEffect(() => {
    const fetchProjectsAndTasks = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks")
        ]);
        
        const allProjects = projRes.data.data.projects || [];
        const allTasks = tasksRes.data.data.tasks || [];
        
        setTasks(allTasks);

        const mappedProjects = allProjects.map(p => {
          const pTasks = allTasks.filter(t => (t.projectId._id || t.projectId) === p._id);
          const totalTasks = pTasks.length;
          const completedTasks = pTasks.filter(t => t.status === 'APPROVED').length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          return {
            id: p._id,
            name: p.title,
            description: p.description,
            status: p.status,
            progress: progress,
            mentor: p.mentorId ? {
              name: p.mentorId.name || "Mentor",
              avatar: p.mentorId.name ? p.mentorId.name.substring(0, 2).toUpperCase() : "M",
              color: avatarColor(p.mentorId._id || p.mentorId.name)
            } : null
          };
        });
        
        setProjects(mappedProjects);
      } catch (error) {
        console.error("Error fetching mentee projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndTasks();
  }, [currentUser.id]);

  const getProjTaskCount = (projectId) => {
    return tasks.filter(t => (t.projectId._id || t.projectId) === projectId).length;
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
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
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
