import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
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
        <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedProjectId(null)}
              className="w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            >
              ←
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{selectedProj.name}</h1>
                <StatusBadge status={selectedProj.status} />
              </div>
              <p className="m-0 mt-1 text-slate-500 text-sm">Workspace tracking console & dynamic reviews</p>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-4 flex-wrap border-b border-slate-200 pb-2">
          {["Overview", "Tasks", "Team", "Reviews"].map(tab => (
            <button
              key={tab}
              onClick={() => setProjectTab(tab)}
              className={`px-4 py-2 text-sm font-semibold transition-all border-none bg-transparent cursor-pointer relative ${
                projectTab === tab ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
              {projectTab === tab && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Content rendering */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          {projectTab === "Overview" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="m-0 text-slate-900 text-lg font-bold">Project Background</h3>
                <p className="m-0 mt-2 text-slate-600 text-sm leading-relaxed">
                  {selectedProj.description || "This workspace coordinates core deliverables and feedback reviews between the mentor and assigned mentees."}
                </p>
              </div>
              <hr className="border-0 border-t border-slate-200 m-0" />
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Completion Rate</span>
                <ProgressBar value={selectedProj.progress} />
              </div>
            </div>
          )}

          {projectTab === "Tasks" && (
            <div className="flex flex-col gap-4">
              <h3 className="m-0 text-slate-900 text-lg font-bold">Task Deliverables ({projTasks.length})</h3>
              {projTasks.length === 0 ? (
                <div className="text-slate-500 italic text-sm py-4">No tasks launched for this project track yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        {["Task Title", "Assignee", "Priority", "Status"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projTasks.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900 text-sm">{t.title}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{t.assigneeName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{t.priority}</td>
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
              <h3 className="m-0 text-slate-900 text-lg font-bold">Assigned Mentees ({selectedProj.mentees ? selectedProj.mentees.length : 0})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedProj.mentees && selectedProj.mentees.map(m => (
                  <div key={m.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center gap-4 hover:shadow-sm transition-shadow">
                    <Avatar initials={m.avatar} color={m.color} size={40} />
                    <div className="min-w-0 flex-1">
                      <span className="block font-bold text-slate-900 text-sm truncate">{m.name}</span>
                      <span className="block text-xs text-slate-500 truncate">{m.email}</span>
                    </div>
                    <a
                      href={`mailto:${m.email}`}
                      className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm hover:bg-blue-100 transition-colors"
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
              <h3 className="m-0 text-slate-900 text-lg font-bold">Pending Task Submissions ({projSubmissions.length})</h3>
              {projSubmissions.length === 0 ? (
                <div className="text-slate-500 italic text-sm py-4">All student submissions successfully graded!</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {projSubmissions.map(t => {
                    const activeSub = t.submissions && t.submissions.find(s => s.status === "PENDING") || t.submissions && t.submissions[t.submissions.length - 1];
                    return (
                      <div key={t.id} className="border border-slate-200 rounded-xl p-6 flex flex-col gap-4 bg-slate-50">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-slate-900 text-sm font-bold">{t.title}</span>
                            <span className="block text-xs text-slate-500 mt-1">Submitted by: {t.assigneeName}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md uppercase border border-amber-200">Under Review</span>
                        </div>
                        {activeSub && (
                          <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed">
                            "{activeSub.content}"
                          </div>
                        )}
                        <div className="flex gap-3 items-center mt-2 w-full">
                          <input
                            placeholder="Add grading feedback..."
                            value={gradeComment}
                            onChange={(e) => setGradeComment(e.target.value)}
                            className="px-4 py-2 text-sm rounded-lg border border-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex-1 bg-white transition-colors"
                          />
                          <Button
                            variant="danger"
                            onClick={() => handleGrade(t.id, "reject")}
                            className="px-4 py-2 text-sm"
                          >
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleGrade(t.id, "approve")}
                            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                          >
                            Approve
                          </Button>
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
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">My Projects Directory</h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">Oversee workspaces assigned to you by organization admins.</p>
      </div>

      {/* Projects Grid Table */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
          No active projects assigned yet.
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

              <div className="flex flex-col gap-5 border-t border-slate-100 pt-5">
                {/* Mentees Overlapping Avatars stack */}
                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-2">Project Team</span>
                  {p.mentees && p.mentees.length > 0 ? (
                    <div className="flex -space-x-2 overflow-hidden">
                      {p.mentees.slice(0, 3).map(m => (
                        <div
                          key={m.id}
                          title={m.name}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-white cursor-help"
                          style={{ backgroundColor: m.color }}
                        >
                          {m.avatar}
                        </div>
                      ))}
                      {p.mentees.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 ring-2 ring-white flex items-center justify-center text-[10px] font-semibold">
                          +{p.mentees.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 italic">No mentees assigned</span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-slate-900">{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} />
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setSelectedProjectId(p.id)}
                  className="w-full justify-center"
                >
                  Open Workspace
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
