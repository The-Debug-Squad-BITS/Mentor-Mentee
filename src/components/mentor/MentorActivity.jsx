import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

export default function MentorActivity() {
  const [logs, setLogs] = useState([]);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "2",
    name: "Sarah Connor",
    role: "MENTOR"
  };

  useEffect(() => {
    // Stubbed until integrated with backend API
    setLogs([]);
  }, [currentUser.id]);

  const getEventMeta = (text) => {
    const t = text.toLowerCase();
    if (t.includes("project")) {
      return { icon: "🛠️", color: "bg-blue-50 text-blue-700 border-blue-200", label: "Project Workspace" };
    }
    if (t.includes("feedback") || t.includes("comment") || t.includes("review")) {
      return { icon: "📝", color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Task Review" };
    }
    if (t.includes("task") || t.includes("deliverable")) {
      return { icon: "📋", color: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Task Assignment" };
    }
    return { icon: "⚡", color: "bg-purple-50 text-purple-700 border-purple-200", label: "Workspace Event" };
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Project Activities</h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">Audit trail of all tasks assigned, comments written, and project statuses updated under your tracks.</p>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No recent activities logged in your workspaces.</div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 pl-6 flex flex-col gap-6 py-2">
            {logs.map((log) => {
              const meta = getEventMeta(log.text);
              return (
                <div key={log.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className={`w-8 h-8 rounded-full border-2 border-white absolute -left-[41px] top-0 sm:top-1 flex items-center justify-center text-sm shadow-sm ${meta.color.split(" ")[0]} ${meta.color.split(" ")[1]}`}>
                    {meta.icon}
                  </span>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider border ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-slate-500 text-xs font-medium">{log.time}</span>
                    </div>
                    <p className="m-0 mt-2 text-slate-700 text-sm leading-relaxed">
                      {log.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
