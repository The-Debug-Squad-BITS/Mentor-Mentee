import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";
import { useAuthStore } from "../../store/authStore";

export default function MentorTasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");

  // Selection state for Task Inspector Drawer
  const [selectedTask, setSelectedTask] = useState(null);
  const [gradeComment, setGradeComment] = useState("");

  // Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskMenteeId, setTaskMenteeId] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDeadline, setTaskDeadline] = useState("");

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "2",
    name: "Sarah Connor",
    role: "MENTOR"
  };

  const refreshTasksList = () => {
    // Stubbed until integrated with backend API
    setTasks([]);
    setProjects([]);
  };

  useEffect(() => {
    refreshTasksList();
  }, [currentUser.id]);

  const handleLaunchTask = (e) => {
    e.preventDefault();
    if (!taskTitle || !taskMenteeId || !taskProjectId) return;

    // Stubbed until integrated with backend API
    setTaskTitle("");
    setTaskDesc("");
    setTaskMenteeId("");
    setTaskPriority("MEDIUM");
    setTaskDeadline("");
    setShowCreateModal(false);
    refreshTasksList();
  };

  const handleGradeTask = (action) => {
    if (!selectedTask) return;
    // Stubbed until integrated with backend API
    setGradeComment("");
    refreshTasksList();
  };

  // Extract mentees assigned to selected creation project
  const currentProjMentees = [];

  // Filter Logic
  const filtered = tasks
    .filter(t => statusFilter === "ALL" || t.status === statusFilter)
    .filter(t => projectFilter === "ALL" || t.projectId === projectFilter)
    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()));

  const statusStyles = {
    PENDING: "bg-slate-100 text-slate-600 border-slate-200",
    SUBMITTED: "bg-amber-50 text-amber-600 border-amber-100",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">
      {/* Title & Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">Project Tasks Workspace</h1>
          <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Assign deliverables, review uploads, and comment on milestones.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl border-none text-xs cursor-pointer transition-colors shadow-lg shadow-indigo-500/20"
          style={{ fontFamily: "inherit" }}
        >
          + Assign Task
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-slate-50 font-sans w-full sm:w-48"
          />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold text-slate-600 outline-none w-full sm:w-44"
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
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              {status === "ALL" ? "All Tasks" : status === "SUBMITTED" ? "Awaiting Review" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Split catalog layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Table of Tasks */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden flex-1 w-full animate-fade-in" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">No tasks assigned matching filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-130">
                <thead>
                  <tr className="bg-slate-50">
                    {["Task Title", "Project Track", "Assignee", "Priority", "Status"].map(h => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors duration-150 ${
                        selectedTask && selectedTask.id === t.id ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-black text-slate-800 text-xs md:text-sm">{t.title}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-semibold">{t.projectName}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-bold">{t.assigneeName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] text-slate-500 font-extrabold uppercase">{t.priority}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${statusStyles[t.status]}`}>
                          {t.status === "SUBMITTED" ? "Under Review" : t.status === "APPROVED" ? "Completed" : t.status === "REJECTED" ? "Revision Needed" : t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Task Inspector Sidebar Drawer */}
        {selectedTask && (
          <div
            className="w-full xl:w-80 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-6 shrink-0 relative animate-fade-in"
            style={{ boxShadow: "0 4px 20px rgba(99,102,241,0.06)" }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center cursor-pointer border-none text-sm transition-colors"
            >
              ✕
            </button>

            {/* Title / Description */}
            <div>
              <div className="flex gap-2 items-center mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-slate-500 font-bold text-[9px] uppercase">{selectedTask.projectName}</span>
                <span className={`px-2 py-0.5 border rounded-lg text-[9px] font-bold uppercase ${statusStyles[selectedTask.status]}`}>
                  {selectedTask.status}
                </span>
              </div>
              <h3 className="m-0 text-base font-black text-slate-800 leading-snug">{selectedTask.title}</h3>
              <p className="m-0 mt-2 text-slate-400 text-xs font-semibold leading-relaxed">
                {selectedTask.description || "Task instructions and guidelines."}
              </p>
            </div>

            <hr className="border-0 border-t border-slate-100 m-0" />

            {/* Task variables */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">ASSIGNEE:</span>
                <span className="font-extrabold text-slate-700">{selectedTask.assigneeName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">DEADLINE:</span>
                <span className="font-extrabold text-indigo-600">{selectedTask.deadline}</span>
              </div>
            </div>

            <hr className="border-0 border-t border-slate-100 m-0" />

            {/* Student Deliverables Submission */}
            {selectedTask.status === "SUBMITTED" || selectedTask.submissions && selectedTask.submissions.length > 0 ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Student Submission</label>
                {(() => {
                  const sub = selectedTask.submissions && selectedTask.submissions.find(s => s.status === "PENDING") || selectedTask.submissions && selectedTask.submissions[selectedTask.submissions.length - 1];
                  return sub ? (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-semibold leading-relaxed">
                      "{sub.content}"
                    </div>
                  ) : <div className="text-slate-400 italic text-xs">No submission recorded.</div>;
                })()}
              </div>
            ) : null}

            {/* Grade actions */}
            {selectedTask.status === "SUBMITTED" && (
              <div className="flex flex-col gap-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Grading Review Panel</label>
                <textarea
                  placeholder="constructive feedback notes..."
                  value={gradeComment}
                  onChange={(e) => setGradeComment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 resize-none font-sans bg-slate-50/50"
                  style={{ minHeight: 65 }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGradeTask("reject")}
                    className="flex-1 bg-transparent border border-red-200 hover:border-red-400 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 cursor-pointer transition-colors"
                    style={{ fontFamily: "inherit" }}
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={() => handleGradeTask("approve")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold border-0 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                    style={{ fontFamily: "inherit" }}
                  >
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign Task Modal overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-250 p-4" style={{ background: "rgba(15,23,42,0.5)" }} onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <form onSubmit={handleLaunchTask} className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col gap-5 animate-fade-in" style={{ boxShadow: "0 24px 80px rgba(99,102,241,0.15)" }}>
            <div>
              <h3 className="m-0 text-lg font-black text-slate-800">Assign New Task</h3>
              <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Assign milestone deliverables under active projects.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Project Track</label>
                <select
                  required
                  value={taskProjectId}
                  onChange={(e) => {
                    setTaskProjectId(e.target.value);
                    setTaskMenteeId(""); // reset selected mentee
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-white"
                  style={{ fontFamily: "inherit" }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Target Mentee</label>
                <select
                  required
                  value={taskMenteeId}
                  onChange={(e) => setTaskMenteeId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-white"
                  style={{ fontFamily: "inherit" }}
                >
                  <option value="">-- Select Assignee --</option>
                  {currentProjMentees.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Task Title</label>
                <input
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Conduct user feedback analysis"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 font-sans"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Describe guidelines..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 resize-none font-sans"
                  style={{ minHeight: 60 }}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-white"
                    style={{ fontFamily: "inherit" }}
                  >
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Deadline</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 bg-white"
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl border-none bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white cursor-pointer transition-colors shadow-md"
                style={{ fontFamily: "inherit" }}
              >
                Launch Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
