import { useState, useEffect } from "react";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const refreshLogs = () => {
    // Stubbed until integrated with backend API
    setLogs([]);
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const getEventMeta = (text) => {
    const t = text.toLowerCase();
    if (t.includes("project")) {
      return { icon: "🛠️", color: "bg-blue-50 text-blue-700 border-blue-200", label: "Project" };
    }
    if (t.includes("user") || t.includes("mentor") || t.includes("mentee")) {
      return { icon: "👥", color: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Membership" };
    }
    if (t.includes("invite") || t.includes("invitation")) {
      return { icon: "✉️", color: "bg-amber-50 text-amber-700 border-amber-200", label: "Invitation" };
    }
    if (t.includes("task") || t.includes("milestone") || t.includes("work")) {
      return { icon: "📝", color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Task / Flow" };
    }
    return { icon: "⚡", color: "bg-slate-100 text-slate-700 border-slate-200", label: "System" };
  };

  const filtered = logs.filter(l => l.text.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Title & Actions Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">System Activity Logs</h1>
          <p className="m-0 mt-1 text-slate-500 text-sm">Audit trail of all administrative actions, membership assignments, and project operations.</p>
        </div>
        <input
          placeholder="Filter logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
        />
      </div>

      {/* Timeline Layout */}
      <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No logs matching search criteria.</div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 flex flex-col gap-8 py-2">
            {filtered.map((log) => {
              const meta = getEventMeta(log.text);
              return (
                <div key={log.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 group">
                  {/* Circle dot anchor */}
                  <span className={`w-8 h-8 rounded-full border-2 border-white absolute -left-[41px] top-0 sm:top-1 flex items-center justify-center text-sm shadow-sm transition-transform group-hover:scale-110 ${meta.color.split(" ")[0]} ${meta.color.split(" ")[1]}`}>
                    {meta.icon}
                  </span>
                  
                  {/* Event Text & Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-3 items-center flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wide border ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-slate-500 text-xs font-medium">{log.time}</span>
                    </div>
                    <p className="m-0 mt-2 text-slate-900 text-sm leading-relaxed">
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
