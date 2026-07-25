import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";

export default function MenteeProjects() {
  const [projects, setProjects] = useState([]);
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
              color: "#" + Math.floor(Math.random()*16777215).toString(16).padEnd(6, '0')
            } : null
          };
        });
        
        setProjects(mappedProjects);
      } catch (error) {
        console.error("Error fetching mentee projects:", error);
      }
    };

    fetchProjectsAndTasks();
  }, [currentUser.id]);

  const getProjTaskCount = (projectId) => {
    return tasks.filter(t => (t.projectId._id || t.projectId) === projectId).length;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">My Assigned Projects</h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">Oversee workspaces assigned to you by administrators.</p>
      </div>

      {/* Grid listing */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
          No projects assigned to your student track yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5 transition-all hover:-translate-y-1 hover:shadow-lg duration-200 shadow-sm"
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h3 className="m-0 text-sm md:text-base font-bold text-slate-900 tracking-tight max-w-[150px] truncate">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="m-0 text-sm text-slate-500 line-clamp-2">
                  {p.description || "Workspace tracking console."}
                </p>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
                {/* Lead Advisor Info */}
                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-2">Lead Advisor</span>
                  {p.mentor ? (
                    <div className="flex items-center gap-3">
                      <Avatar initials={p.mentor.avatar} color={p.mentor.color} size={32} />
                      <div className="min-w-0">
                        <span className="block font-medium text-slate-900 text-sm truncate">{p.mentor.name}</span>
                        <span className="block text-xs text-slate-500">Supervisor</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 italic">Unassigned</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Tasks Created</span>
                  <span className="font-semibold text-slate-900">{getProjTaskCount(p.id)} tasks</span>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-slate-900">{p.progress}%</span>
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
