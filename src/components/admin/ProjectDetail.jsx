import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
export default function ProjectDetail({ projectId, onBack, onRefresh }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Inline actions states
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedMentee, setSelectedMentee] = useState("");
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskMentee, setTaskMentee] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskDeadline, setTaskDeadline] = useState("");

  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("Active");

  const refreshProjectData = () => {
    // Stubbed until integrated with backend API
    const defaultProject = {
      id: projectId,
      name: "Project Tracker",
      description: "This project is managed under your organization console. Members coordinate milestones, tasks, and reviews dynamically.",
      status: "Active",
      progress: 0,
      mentor: null,
      mentees: []
    };
    setProject(defaultProject);
    setEditName(defaultProject.name);
    setEditDesc(defaultProject.description);
    setEditStatus(defaultProject.status);
    setTasks([]);
    setLogs([]);
  };

  useEffect(() => {
    refreshProjectData();
  }, [projectId]);

  if (!project) return <div className="p-8 text-center text-slate-500 font-bold">Project not found.</div>;

  const mentors = [];
  const mentees = [];

  const handleConfirmAssignment = () => {
    // Stubbed until integrated with backend API
    setSelectedMentor("");
    setSelectedMentee("");
    setShowAssignForm(false);
    refreshProjectData();
    if (onRefresh) onRefresh();
  };

  const handleCreateTask = () => {
    if (!taskTitle || !taskMentee) {
      alert("Please enter a task title and select a mentee.");
      return;
    }
    // Stubbed until integrated with backend API
    setTaskTitle("");
    setTaskMentee("");
    setTaskPriority("Medium");
    setTaskDeadline("");
    setShowTaskForm(false);
    refreshProjectData();
    if (onRefresh) onRefresh();
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    // Stubbed until integrated with backend API
    setShowEditForm(false);
    refreshProjectData();
    if (onRefresh) onRefresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
          >
            ←
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Project Overseer & Deliverables Console</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowEditForm(!showEditForm)}
            className="bg-transparent border border-slate-200 hover:border-slate-300 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            style={{ fontFamily: "inherit" }}
          >
            {showEditForm ? "Cancel Edit" : "Edit Project"}
          </button>
          <button
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="bg-transparent border border-slate-200 hover:border-slate-300 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            style={{ fontFamily: "inherit" }}
          >
            {showAssignForm ? "Cancel Assignment" : "Assign Members"}
          </button>
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            style={{ fontFamily: "inherit", boxShadow: "0 4px 12px rgba(59,130,246,0.2)" }}
          >
            {showTaskForm ? "Cancel Task" : "+ Add Task"}
          </button>
        </div>
      </div>

      {/* Edit project settings panel */}
      {showEditForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col gap-4" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.02)" }}>
          <h3 className="m-0 text-sm font-black text-slate-800">Edit Project Settings</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Project Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-blue-400 font-sans"
              />
            </div>
            <div className="flex-1 min-w-[250px]">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
              <input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-blue-400 font-sans"
              />
            </div>
            <div className="w-40">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-blue-400"
                style={{ fontFamily: "inherit" }}
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSaveEdit}
            className="self-start bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs border-0 cursor-pointer transition-colors"
            style={{ fontFamily: "inherit" }}
          >
            Save Project Updates
          </button>
        </div>
      )}
 
      {/* Assignment overlay panel */}
      {showAssignForm && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Assign Mentor</label>
            <select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-blue-400"
              style={{ fontFamily: "inherit" }}
            >
              <option value="">-- Choose Mentor --</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Assign Mentee</label>
            <select
              value={selectedMentee}
              onChange={(e) => setSelectedMentee(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-blue-400"
              style={{ fontFamily: "inherit" }}
            >
              <option value="">-- Choose Mentee --</option>
              {mentees.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleConfirmAssignment}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs border-0 cursor-pointer transition-colors"
            style={{ fontFamily: "inherit" }}
          >
            Confirm
          </button>
        </div>
      )}

      {/* Add Task Panel */}
      {showTaskForm && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 flex flex-col gap-4">
          <h3 className="m-0 text-sm font-black text-slate-800">Quick Assign Task</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Task Title</label>
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task description..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-indigo-400"
                style={{ fontFamily: "inherit" }}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Assignee Mentee</label>
              <select
                value={taskMentee}
                onChange={(e) => setTaskMentee(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-indigo-400"
                style={{ fontFamily: "inherit" }}
              >
                <option value="">-- Choose Mentee --</option>
                {project.mentees.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-indigo-400"
                style={{ fontFamily: "inherit" }}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="w-40">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Deadline</label>
              <input
                type="date"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-indigo-400"
                style={{ fontFamily: "inherit" }}
              />
            </div>
          </div>
          <button
            onClick={handleCreateTask}
            className="self-start bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs border-0 cursor-pointer transition-colors"
            style={{ fontFamily: "inherit" }}
          >
            Create & Assign Task
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Progress & Description */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
            <h2 className="m-0 mb-4 text-sm md:text-base font-extrabold text-slate-800">Project Description & Progress</h2>
            <p className="m-0 mb-6 text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
              {project.description || "This project is managed under your organization console. Members coordinate milestones, tasks, and reviews dynamically."}
            </p>
            <div>
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-2">
                <span>COMPLETION RATE</span>
                <span>{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} />
            </div>
          </div>

          {/* Members assigned */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
            <h2 className="m-0 mb-5 text-sm md:text-base font-extrabold text-slate-800">Project Team Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mentors */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Assigned Mentor</span>
                {project.mentor ? (
                  <div className="flex items-center gap-3">
                    <Avatar initials={project.mentor.avatar} color={project.mentor.color} size={36} />
                    <div className="min-w-0">
                      <span className="block font-bold text-slate-800 text-xs md:text-sm truncate">{project.mentor.name}</span>
                      <span className="block text-[11px] text-slate-400 font-semibold">{project.mentor.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic py-2 font-medium">No mentor assigned yet.</div>
                )}
              </div>

              {/* Mentees */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Assigned Mentees ({project.mentees.length})</span>
                {project.mentees.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {project.mentees.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <Avatar initials={m.avatar} color={m.color} size={24} />
                        <span className="font-bold text-slate-700 text-xs truncate">{m.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic py-2 font-medium">No mentees assigned yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Task Summary Table */}
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
              <h2 className="m-0 text-sm md:text-base font-extrabold text-slate-800">Task Summary ({tasks.length})</h2>
            </div>
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">No tasks assigned under this project yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-100">
                  <thead>
                    <tr className="bg-slate-50">
                      {["Task Title", "Assignee", "Priority", "Status"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-800 text-xs md:text-sm">{t.title}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold">{t.assigneeName}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-bold">{t.priority}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 flex flex-col gap-5" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
          <h2 className="m-0 text-sm md:text-base font-extrabold text-slate-800">Project Timeline</h2>
          {logs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-semibold">No historical activity logged for this project.</div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-1">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 items-start border-l-2 border-slate-100 pl-4 relative pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute -left-[6px] top-1" />
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-xs text-slate-600 font-semibold leading-relaxed">{log.text}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block font-medium">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
