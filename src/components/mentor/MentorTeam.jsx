import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";

export default function MentorTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "2",
    name: "Sarah Connor",
    role: "MENTOR"
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks")
        ]);

        const projects = projRes.data.data.projects || [];
        const tasks = tasksRes.data.data.tasks || [];

        const menteeStats = {};
        tasks.forEach(t => {
          const mId = t.assignedTo?._id || t.assignedTo;
          const pId = t.projectId?._id || t.projectId;
          if (!mId) return;

          const key = `${mId}_${pId}`;
          if (!menteeStats[key]) {
            menteeStats[key] = { total: 0, completed: 0 };
          }
          menteeStats[key].total += 1;
          if (t.status === 'APPROVED') {
            menteeStats[key].completed += 1;
          }
        });

        const membersMap = new Map();

        projects.forEach(p => {
          if (p.mentees && p.mentees.length > 0) {
            p.mentees.forEach(m => {
              const mId = m._id;
              const key = `${mId}_${p._id}`;
              const stats = menteeStats[key] || { total: 0, completed: 0 };
              const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              
              if (!membersMap.has(mId)) {
                membersMap.set(mId, {
                  id: mId,
                  name: m.name,
                  email: m.email,
                  avatar: m.name ? m.name.substring(0, 2).toUpperCase() : "U",
                  color: "#" + Math.floor(Math.random()*16777215).toString(16).padEnd(6, '0'),
                  projects: []
                });
              }
              
              membersMap.get(mId).projects.push({
                projectId: p._id,
                projectName: p.title,
                projectStatus: p.status,
                progress: progress
              });
            });
          }
        });

        setTeamMembers(Array.from(membersMap.values()));
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };

    fetchTeamMembers();
  }, [currentUser.id]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Mentees Directory</h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">Review member details and progress charts for team members under your supervision.</p>
      </div>

      {/* Grid List */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {teamMembers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border border-slate-200 text-center text-slate-500 text-sm w-full shadow-sm">
              No mentees currently assigned to your projects.
            </div>
          ) : (
            teamMembers.map(m => (
              <div
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className={`bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md duration-200 shadow-sm ${
                  selectedMember && selectedMember.id === m.id ? "bg-blue-50/50 border-blue-200" : ""
                }`}
              >
                <Avatar initials={m.avatar} color={m.color} size={48} />
                <div className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900 text-sm md:text-base truncate">{m.name}</span>
                  <span className="block text-xs text-slate-500 truncate mb-2">{m.email}</span>
                  <div className="flex gap-2 flex-wrap">
                    {m.projects.map(proj => (
                      <span key={proj.projectId} className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                        {proj.projectName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Member Profile Drawer */}
        {selectedMember && (
          <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 shrink-0 relative animate-fade-in shadow-md">
            {/* Close */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center cursor-pointer border-none text-sm transition-colors"
            >
              ✕
            </button>

            {/* Avatar header */}
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar initials={selectedMember.avatar} color={selectedMember.color} size={80} />
              <div>
                <h3 className="m-0 text-lg font-bold text-slate-900 leading-tight">{selectedMember.name}</h3>
                <span className="text-slate-500 text-sm">{selectedMember.email}</span>
              </div>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md mt-1">
                Active Member
              </span>
            </div>

            <hr className="border-0 border-t border-slate-200 m-0" />

            {/* Project track info */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Workspaces</label>
              {selectedMember.projects.map(proj => (
                <div key={proj.projectId} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-3 mb-2 shrink-0">
                  <div className="flex justify-between items-center text-sm gap-2">
                    <span className="font-semibold text-slate-900 truncate" title={proj.projectName}>{proj.projectName}</span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-100 px-2 py-0.5 rounded border border-blue-200 shrink-0">{proj.projectStatus}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
                      <span>Track Completion</span>
                      <span className="font-semibold text-slate-900">{proj.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${proj.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-0 border-t border-slate-200 m-0" />

            <Button
              as="a"
              href={`mailto:${selectedMember.email}`}
              className="w-full justify-center"
            >
              ✉️ Send Workspace Alert
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
