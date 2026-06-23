import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import { useAuthStore } from "../../store/authStore";

export default function MentorProjects() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectTab, setProjectTab] = useState("Overview"); // Overview | Tasks | Team | Reviews
  
  // Grading actions inside nested Reviews
  const [gradeComment, setGradeComment] = useState("");

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "2",
    name: "Sarah Connor",
    role: "MENTOR"
  };

  const refreshProjectsList = () => {
    // Stubbed until integrated with backend API
    setProjects([]);
  };

  useEffect(() => {
    refreshProjectsList();
  }, [currentUser.id]);

  const selectedProj = projects.find(p => p.id === selectedProjectId);
  const projTasks = [];
  const projSubmissions = [];

  const handleGrade = (taskId, action) => {
    // Stubbed until integrated with backend API
    setGradeComment("");
    refreshProjectsList();
  };

  if (selectedProj) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">
        {/* Workspace Detail Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedProjectId(null)}
              className="w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            >
              ←
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">{selectedProj.name}</h1>
                <StatusBadge status={selectedProj.status} />
              </div>
              <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Workspace tracking console & dynamic reviews</p>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-2">
          {["Overview", "Tasks", "Team", "Reviews"].map(tab => (
            <button
              key={tab}
              onClick={() => setProjectTab(tab)}
              className={`px-4 py-2 text-xs font-extrabold transition-all border-none bg-transparent cursor-pointer relative ${
                projectTab === tab ? "text-indigo-600 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              {tab}
              {projectTab === tab && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Content rendering */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
          {projectTab === "Overview" && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="m-0 text-slate-800 text-base font-black">Project Background</h3>
                <p className="m-0 mt-2 text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                  {selectedProj.description || "This workspace coordinates core deliverables and feedback reviews between the mentor and assigned mentees."}
                </p>
              </div>
              <hr className="border-0 border-t border-slate-100 m-0" />
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Completion Rate</span>
                <ProgressBar value={selectedProj.progress} />
              </div>
            </div>
          )}

          {projectTab === "Tasks" && (
            <div className="flex flex-col gap-4">
              <h3 className="m-0 text-slate-800 text-base font-black">Task Deliverables ({projTasks.length})</h3>
              {projTasks.length === 0 ? (
                <div className="text-slate-400 italic text-xs py-4">No tasks launched for this project track yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        {["Task Title", "Assignee", "Priority", "Status"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-slate-400 border-b border-slate-100">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {projTasks.map(t => (
                        <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-700 text-xs">{t.title}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-semibold">{t.assigneeName}</td>
                          <td className="px-4 py-3 text-xs text-slate-400 font-bold">{t.priority}</td>
                          <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {projectTab === "Team" && (
            <div className="flex flex-col gap-4">
              <h3 className="m-0 text-slate-800 text-base font-black">Assigned Mentees ({selectedProj.mentees ? selectedProj.mentees.length : 0})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedProj.mentees && selectedProj.mentees.map(m => (
                  <div key={m.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex items-center gap-3">
                    <Avatar initials={m.avatar} color={m.color} size={36} />
                    <div className="min-w-0 flex-1">
                      <span className="block font-black text-slate-800 text-xs md:text-sm truncate">{m.name}</span>
                      <span className="block text-[11px] text-slate-400 font-semibold truncate">{m.email}</span>
                    </div>
                    <a
                      href={`mailto:${m.email}`}
                      className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs hover:bg-indigo-100 transition-colors"
                      title={`Send email to ${m.name}`}
                    >
                      ✉️
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projectTab === "Reviews" && (
            <div className="flex flex-col gap-4">
              <h3 className="m-0 text-slate-800 text-base font-black">Pending Task Submissions ({projSubmissions.length})</h3>
              {projSubmissions.length === 0 ? (
                <div className="text-slate-400 italic text-xs py-4">All student submissions successfully graded!</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {projSubmissions.map(t => {
                    const activeSub = t.submissions && t.submissions.find(s => s.status === "PENDING") || t.submissions && t.submissions[t.submissions.length - 1];
                    return (
                      <div key={t.id} className="border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 bg-slate-50/30">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-slate-800 text-xs md:text-sm font-black">{t.title}</span>
                            <span className="block text-[10px] text-slate-400 font-bold mt-0.5">Submitted by: {t.assigneeName}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">Under Review</span>
                        </div>
                        {activeSub && (
                          <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold leading-relaxed">
                            "{activeSub.content}"
                          </div>
                        )}
                        <div className="flex gap-2 items-center mt-2 w-full">
                          <input
                            placeholder="Add grading feedback..."
                            value={gradeComment}
                            onChange={(e) => setGradeComment(e.target.value)}
                            className="px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none flex-1 font-sans bg-white"
                          />
                          <button
                            onClick={() => handleGrade(t.id, "reject")}
                            className="bg-transparent border border-red-200 hover:border-red-400 px-3 py-2 rounded-xl text-xs font-bold text-red-500 cursor-pointer transition-colors"
                            style={{ fontFamily: "inherit" }}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleGrade(t.id, "approve")}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 border-0 rounded-xl text-xs cursor-pointer transition-colors"
                            style={{ fontFamily: "inherit" }}
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">My Projects Directory</h1>
        <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Oversee workspaces assigned to you by organization admins.</p>
      </div>

      {/* Projects Grid Table */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center text-slate-400 text-xs font-semibold" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
          No active projects assigned yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div
              key={p.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 duration-300"
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

              <div className="flex flex-col gap-4">
                {/* Mentees Overlapping Avatars stack */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Project Team</span>
                  {p.mentees && p.mentees.length > 0 ? (
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {p.mentees.slice(0, 3).map(m => (
                        <div
                          key={m.id}
                          title={m.name}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-black text-white cursor-help"
                          style={{ backgroundColor: m.color }}
                        >
                          {m.avatar}
                        </div>
                      ))}
                      {p.mentees.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-500 ring-2 ring-white flex items-center justify-center text-[9px] font-bold">
                          +{p.mentees.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No mentees assigned</span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                    <span>PROGRESS</span>
                    <span>{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} />
                </div>

                <button
                  onClick={() => setSelectedProjectId(p.id)}
                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold border-none py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                  style={{ fontFamily: "inherit" }}
                >
                  Open Workspace
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
