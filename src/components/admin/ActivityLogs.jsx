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
      return { icon: "🛠️", color: "bg-blue-50 text-blue-600 border-blue-100", label: "Project" };
    }
    if (t.includes("user") || t.includes("mentor") || t.includes("mentee")) {
      return { icon: "👥", color: "bg-purple-50 text-purple-600 border-purple-100", label: "Membership" };
    }
    if (t.includes("invite") || t.includes("invitation")) {
      return { icon: "✉️", color: "bg-amber-50 text-amber-600 border-amber-100", label: "Invitation" };
    }
    if (t.includes("task") || t.includes("milestone") || t.includes("work")) {
      return { icon: "📝", color: "bg-indigo-50 text-indigo-600 border-indigo-100", label: "Task / Flow" };
    }
    return { icon: "⚡", color: "bg-slate-50 text-slate-600 border-slate-100", label: "System" };
  };

  const filtered = logs.filter(l => l.text.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Actions Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">System Activity Logs</h1>
          <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Audit trail of all administrative actions, membership assignments, and project operations.</p>
        </div>
        <input
          placeholder="Filter logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 bg-slate-50 font-sans"
        />
      </div>

      {/* Timeline Layout */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">No logs matching search criteria.</div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 pl-6 flex flex-col gap-6 py-2">
            {filtered.map((log) => {
              const meta = getEventMeta(log.text);
              return (
                <div key={log.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Circle dot anchor */}
                  <span className={`w-8 h-8 rounded-full border-2 border-white absolute -left-[41px] top-0 sm:top-1 flex items-center justify-center text-sm shadow-sm ${meta.color.split(" ")[0]} ${meta.color.split(" ")[1]}`}>
                    {meta.icon}
                  </span>
                  
                  {/* Event Text & Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-md tracking-wider border ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-slate-400 text-[11px] font-bold">{log.time}</span>
                    </div>
                    <p className="m-0 mt-1.5 text-slate-700 text-xs md:text-sm font-semibold leading-relaxed">
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
