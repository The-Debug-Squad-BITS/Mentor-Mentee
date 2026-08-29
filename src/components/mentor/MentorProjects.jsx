import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import { ArrowLeft, Folder, Mail, CheckCircle, Inbox } from "../ui/Icons";
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
          <span className="skeleton h-7 w-7 rounded-full" />
          <span className="skeleton h-3 w-20 ml-auto" />
        </div>
      </div>
    </div>
  );
}

export default function MentorProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectTab, setProjectTab] = useState("Overview"); // Overview | Tasks | Team | Reviews

  // Grading actions inside nested Reviews
  const [gradeComment, setGradeComment] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "2",
    name: "Sarah Connor",
    role: "MENTOR"
  };

  const formatStatus = (s) => {
    if (s === "APPROVED") return "Completed";
    if (s === "TODO") return "To Do";
    if (s === "IN_PROGRESS") return "In Progress";
    if (s === "SUBMITTED" || s === "UNDER_REVIEW") return "Under Review";
    if (s === "REVISION_NEEDED") return "Revision Needed";
    return s;
  };

  const refreshProjectsList = async () => {
    try {
      const [projRes, tasksRes, subsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/tasks"),
        api.get("/submissions")
      ]);
      
      const tasks = tasksRes.data.data.tasks || [];
      const submissions = subsRes.data.data.submissions || [];
      
      setAllTasks(tasks);
      setAllSubmissions(submissions);

      const tasksByProject = {};
      tasks.forEach(t => {
        const pId = t.projectId._id || t.projectId;
        if (!tasksByProject[pId]) tasksByProject[pId] = { total: 0, completed: 0 };
        tasksByProject[pId].total += 1;
        if (t.status === 'APPROVED') tasksByProject[pId].completed += 1;
      });

      const mappedProjects = projRes.data.data.projects.map(p => {
        const pStats = tasksByProject[p._id] || { total: 0, completed: 0 };
        const progress = pStats.total > 0 ? Math.round((pStats.completed / pStats.total) * 100) : 0;
        return {
          ...p,
          id: p._id,
          name: p.title,
          progress: progress,
          mentees: (p.mentees || []).map(m => ({
            ...m,
            id: m._id,
            avatar: m.name ? m.name.substring(0, 2).toUpperCase() : "U",
            color: avatarColor(m._id || m.name)
          }))
        };
      });
      setProjects(mappedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjectsList();
  }, [currentUser.id, refreshKey]);

  const selectedProj = projects.find(p => p.id === selectedProjectId);
  
  let projTasks = [];
  let projSubmissions = [];

  if (selectedProj) {
    const rawProjTasks = allTasks.filter(t => (t.projectId._id || t.projectId) === selectedProj.id);
    projTasks = rawProjTasks.map(t => ({
      id: t._id,
      title: t.title,
      assigneeName: t.assignedTo?.name || 'Unassigned',
      priority: t.priority,
      status: formatStatus(t.status)
    }));

    const subsByTask = {};
    allSubmissions.forEach(sub => {
      const tId = sub.taskId._id || sub.taskId;
      if (!subsByTask[tId]) subsByTask[tId] = [];
      subsByTask[tId].push({
        id: sub._id,
        content: sub.submissionUrl || sub.notes || sub.fileUrl || "No content provided",
        status: sub.status === "PENDING_REVIEW" ? "PENDING" : sub.status,
      });
    });

    projSubmissions = projTasks.filter(t => subsByTask[t.id] && subsByTask[t.id].some(s => s.status === 'PENDING')).map(t => ({
      ...t,
      submissions: subsByTask[t.id]
    }));
  }

  const handleGrade = async (taskId, action) => {
    try {
      const task = projSubmissions.find(t => t.id === taskId);
      const activeSub = task?.submissions?.find(s => s.status === "PENDING");
      if (!activeSub) return;
      
      const endpoint = `/submissions/${activeSub.id}/${action === 'approve' ? 'approve' : 'revision'}`;
      await api.patch(endpoint, { feedback: gradeComment || 'Feedback provided' });
      
      setGradeComment("");
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error("Error grading submission:", error);
    }
  };

  if (selectedProj) {
    return (
      <div className="flex flex-col gap-5 animate-fade-in">
        {/* Workspace Detail Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => setSelectedProjectId(null)}
            aria-label="Back to projects"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300
              bg-white text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="page-title m-0">{selectedProj.name}</h1>
              <StatusBadge status={selectedProj.status} />
            </div>
            <p className="page-subtitle mt-1">Workspace tracking console and reviews.</p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200">
          {["Overview", "Tasks", "Team", "Reviews"].map(tab => (
            <button
              key={tab}
              onClick={() => setProjectTab(tab)}
              aria-pressed={projectTab === tab}
              className={`relative -mb-px border-b-2 px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${
                projectTab === tab
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Content rendering */}
        <div className="card p-6">
          {projectTab === "Overview" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="section-title m-0">Project Background</h3>
                <p className="m-0 mt-2 text-[13.5px] leading-relaxed text-slate-600">
                  {selectedProj.description || "This workspace coordinates core deliverables and feedback reviews between the mentor and assigned mentees."}
                </p>
              </div>
              <hr className="m-0 border-0 border-t border-slate-200" />
              <div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Completion Rate
                </span>
                <ProgressBar value={selectedProj.progress} />
              </div>
            </div>
          )}

          {projectTab === "Tasks" && (
            <div className="flex flex-col gap-4">
              <h3 className="section-title m-0">
                Task Deliverables{" "}
                <span className="badge badge-neutral ml-1">{projTasks.length}</span>
              </h3>
              {projTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-[13px] text-slate-500">
                  No tasks launched for this project track yet.
                </div>
              ) : (
                <div className="-mx-6 overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {["Task Title", "Assignee", "Priority", "Status"].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {projTasks.map(t => (
                        <tr key={t.id}>
                          <td className="font-semibold text-slate-900">{t.title}</td>
                          <td>{t.assigneeName}</td>
                          <td>{t.priority}</td>
                          <td><StatusBadge status={t.status} /></td>
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
              <h3 className="section-title m-0">
                Assigned Mentees{" "}
                <span className="badge badge-neutral ml-1">
                  {selectedProj.mentees ? selectedProj.mentees.length : 0}
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedProj.mentees && selectedProj.mentees.map(m => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5"
                  >
                    <Avatar initials={m.avatar} color={m.color} size={40} />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-slate-900">
                        {m.name}
                      </span>
                      <span className="block truncate text-[12.5px] text-slate-500">{m.email}</span>
                    </div>
                    <a
                      href={`mailto:${m.email}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-100
                        bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100"
                      title={`Send email to ${m.name}`}
                      aria-label={`Send email to ${m.name}`}
                    >
                      <Mail size={15} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projectTab === "Reviews" && (
            <div className="flex flex-col gap-4">
              <h3 className="section-title m-0">
                Pending Task Submissions{" "}
                <span className="badge badge-neutral ml-1">{projSubmissions.length}</span>
              </h3>
              {projSubmissions.length === 0 ? (
                <div className="empty-state py-10">
                  <span className="empty-state-icon">
                    <CheckCircle size={22} />
                  </span>
                  <p className="empty-state-title">Review queue is clear</p>
                  <p className="empty-state-text">
                    Every submission on this project has been graded.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {projSubmissions.map(t => {
                    const activeSub = t.submissions && t.submissions.find(s => s.status === "PENDING") || t.submissions && t.submissions[t.submissions.length - 1];
                    return (
                      <div
                        key={t.id}
                        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="text-[14px] font-semibold text-slate-900">{t.title}</span>
                            <span className="mt-0.5 block text-[12.5px] text-slate-500">
                              Submitted by: {t.assigneeName}
                            </span>
                          </div>
                          <span className="badge badge-warning">Under Review</span>
                        </div>

                        {activeSub && (
                          <div className="rounded-lg border border-slate-200 bg-white p-4 text-[13.5px] leading-relaxed text-slate-700">
                            &ldquo;{activeSub.content}&rdquo;
                          </div>
                        )}

                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                          <input
                            placeholder="Add grading feedback..."
                            value={gradeComment}
                            onChange={(e) => setGradeComment(e.target.value)}
                            aria-label="Grading feedback"
                            className="input-field flex-1"
                          />
                          <div className="flex gap-2.5">
                            <Button
                              variant="secondary"
                              onClick={() => handleGrade(t.id, "reject")}
                              className="flex-1 sm:flex-none"
                            >
                              Request revision
                            </Button>
                            <Button
                              variant="success"
                              onClick={() => handleGrade(t.id, "approve")}
                              className="flex-1 sm:flex-none"
                            >
                              Approve
                            </Button>
                          </div>
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
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="page-title m-0">My Projects</h1>
        <p className="page-subtitle mt-1">
          Workspaces assigned to you by organisation administrators.
        </p>
      </div>

      {/* Projects Grid */}
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
              When an administrator assigns you to a project, it will appear here with its team
              and progress.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(p => (
            <div key={p.id} className="card flex flex-col justify-between gap-5 p-5">
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

              <div className="flex flex-col gap-5 border-t border-slate-100 pt-5">
                {/* Mentees stack */}
                <div>
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Project Team
                  </span>
                  {p.mentees && p.mentees.length > 0 ? (
                    <div className="flex gap-1 overflow-hidden">
                      {p.mentees.slice(0, 3).map(m => (
                        <div
                          key={m.id}
                          title={m.name}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[10px]
                            font-semibold text-white ring-2 ring-white"
                          style={{ backgroundColor: m.color }}
                        >
                          {m.avatar}
                        </div>
                      ))}
                      {p.mentees.length > 3 && (
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100
                          text-[10px] font-semibold text-slate-600 ring-2 ring-white">
                          +{p.mentees.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[13px] italic text-slate-500">No mentees assigned</span>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-[13px]">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} />
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setSelectedProjectId(p.id)}
                  className="w-full"
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
