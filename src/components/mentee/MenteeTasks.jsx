import { useState, useEffect } from "react";
import StatusBadge from "../ui/StatusBadge";
import { useAuthStore } from "../../store/authStore";

export default function MenteeTasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");

  // Selection states for task submission/feedback inspector
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState("");

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "1",
    name: "Emily Davies",
    role: "MENTEE"
  };

  const refreshTasks = () => {
    // Stubbed until integrated with backend API
    setTasks([]);
    setProjects([]);
  };

  useEffect(() => {
    refreshTasks();
  }, [currentUser.id]);

  const handleSubmitWork = (e) => {
    e.preventDefault();
    if (!selectedTask || !submissionNotes.trim()) return;

    // Stubbed until integrated with backend API
    setSubmissionNotes("");
    refreshTasks();
    alert("Work submitted successfully for advisor review!");
  };

  // Filter logic
  const filtered = tasks
    .filter(t => statusFilter === "ALL" || t.status === statusFilter)
    .filter(t => projectFilter === "ALL" || t.projectId === projectFilter)
    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const statusStyles = {
    PENDING: "bg-slate-50 text-slate-500 border-slate-200",
    SUBMITTED: "bg-amber-50 text-amber-600 border-amber-100",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">My Assigned Tasks</h1>
        <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Inspect milestone instructions, upload deliverables notes, and check grading comments.</p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input
            placeholder="Search deliverables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-slate-50 font-sans w-full sm:w-48"
          />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold text-slate-600 outline-none w-full sm:w-44"
            style={{ fontFamily: "inherit" }}
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {["ALL", "PENDING", "SUBMITTED", "APPROVED", "REJECTED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === status
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              {status === "ALL" ? "All Tracks" : status === "PENDING" ? "To Do / Active" : status === "SUBMITTED" ? "Submitted" : status === "APPROVED" ? "Completed" : "Revision Needed"}
            </button>
          ))}
        </div>
      </div>

      {/* Main split grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Tasks grid catalog */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center text-slate-400 text-xs font-semibold w-full">
              No tasks match active filter thresholds.
            </div>
          ) : (
            filtered.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className={`bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md duration-200 ${
                  selectedTask && selectedTask.id === t.id ? "bg-indigo-50/20 ring-2 ring-indigo-500/20" : ""
                }`}
                style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded uppercase">{t.projectName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${statusStyles[t.status]}`}>
                      {t.status === "PENDING" ? "To Do" : t.status === "SUBMITTED" ? "Under Review" : t.status === "APPROVED" ? "Completed" : "Revision Needed"}
                    </span>
                  </div>
                  <h3 className="m-0 text-sm md:text-base font-black text-slate-800 tracking-tight leading-snug truncate">{t.title}</h3>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-3">
                  <span>DEADLINE: {t.deadline}</span>
                  <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide">
                    {t.priority}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Task submission drawer */}
        {selectedTask && (
          <div
            className="w-full lg:w-80 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-6 shrink-0 relative animate-fade-in"
            style={{ boxShadow: "0 4px 20px rgba(99,102,241,0.06)" }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center cursor-pointer border-none text-sm transition-colors"
            >
              ✕
            </button>

            {/* Title */}
            <div>
              <div className="flex gap-2 items-center mb-2 flex-wrap">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-bold text-[9px] uppercase">{selectedTask.projectName}</span>
                <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-extrabold uppercase tracking-wide ${statusStyles[selectedTask.status]}`}>
                  {selectedTask.status}
                </span>
              </div>
              <h3 className="m-0 text-base font-black text-slate-800 leading-snug">{selectedTask.title}</h3>
              <p className="m-0 mt-2 text-slate-400 text-xs font-semibold leading-relaxed">
                {selectedTask.description || "Task instructions and academic track milestones."}
              </p>
            </div>

            <hr className="border-0 border-t border-slate-100 m-0" />

            {/* Task variables */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">ASSIGNER ADVISOR:</span>
                <span className="font-extrabold text-slate-700">Sarah Connor</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">DEADLINE:</span>
                <span className="font-extrabold text-indigo-600">{selectedTask.deadline}</span>
              </div>
            </div>

            <hr className="border-0 border-t border-slate-100 m-0" />

            {/* Submission / Actions Area */}
            {(selectedTask.status === "PENDING" || selectedTask.status === "REJECTED") ? (
              <form onSubmit={handleSubmitWork} className="flex flex-col gap-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Upload Deliverables Notes</label>
                <textarea
                  required
                  placeholder="describe your work deliverables / links..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 resize-none font-sans bg-slate-50/50"
                  style={{ minHeight: 75 }}
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs cursor-pointer transition-colors shadow-lg shadow-indigo-500/20"
                  style={{ fontFamily: "inherit" }}
                >
                  Submit Deliverables Review
                </button>
              </form>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">My Submitted Deliverables</label>
                {(() => {
                  const sub = selectedTask.submissions && selectedTask.submissions.find(s => s.status === "PENDING") || selectedTask.submissions && selectedTask.submissions[selectedTask.submissions.length - 1];
                  return sub ? (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-semibold leading-relaxed">
                      "{sub.content}"
                    </div>
                  ) : <div className="text-slate-400 italic text-xs">No deliverables submitted.</div>;
                })()}
              </div>
            )}

            {/* Instructor feedback comments thread */}
            {selectedTask.feedbacks && selectedTask.feedbacks.length > 0 && (
              <div className="flex flex-col gap-3 mt-1">
                <hr className="border-0 border-t border-slate-100 m-0" />
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Advisor Feedback Comments</label>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                  {selectedTask.feedbacks.map(f => (
                    <div key={f.id} className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl flex flex-col gap-1.5">
                      <p className="m-0 text-xs text-slate-600 font-semibold leading-relaxed">"{f.comment}"</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase">
                        <span>Sarah Connor</span>
                        <span>{f.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
