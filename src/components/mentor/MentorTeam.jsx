import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import { Close, Users, Mail } from "../ui/Icons";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
import { avatarColor } from "../../lib/avatarColor";

/* Matches the member card's shape so the swap to real data doesn't jump. */
function MemberCardSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="skeleton h-11 w-11 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="skeleton h-3.5 w-1/2" />
        <span className="skeleton h-3 w-3/4" />
        <span className="skeleton h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}

export default function MentorTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
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
                  color: avatarColor(mId || m.name),
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
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [currentUser.id]);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title m-0">Mentees Directory</h1>
        <p className="page-subtitle mt-1">
          Member details and progress for everyone under your supervision.
        </p>
      </div>

      {/* Grid List */}
      <div className="flex flex-col items-start gap-5 lg:flex-row">
        <div className="grid w-full min-w-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          {loading ? (
            <>
              {[0, 1, 2, 3].map((i) => <MemberCardSkeleton key={i} />)}
            </>
          ) : teamMembers.length === 0 ? (
            <div className="card col-span-full">
              <div className="empty-state">
                <span className="empty-state-icon">
                  <Users size={22} />
                </span>
                <p className="empty-state-title">No mentees assigned yet</p>
                <p className="empty-state-text">
                  Students assigned to your projects will appear here, along with their
                  workspace and progress.
                </p>
              </div>
            </div>
          ) : (
            teamMembers.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMember(m)}
                aria-pressed={selectedMember?.id === m.id}
                className={`flex items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-xs
                  transition-[box-shadow,border-color] duration-200 hover:shadow-md ${
                    selectedMember && selectedMember.id === m.id
                      ? "border-brand-300 ring-2 ring-brand-500/15"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
              >
                <Avatar initials={m.avatar} color={m.color} size={48} />
                <div className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900 text-sm md:text-base truncate">{m.name}</span>
                  <span className="block text-xs text-slate-500 truncate mb-2">{m.email}</span>
                  <div className="flex gap-2 flex-wrap">
                    {m.projects.map(proj => (
                      <span key={proj.projectId} className="badge badge-brand">
                        {proj.projectName}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Member Profile Drawer */}
        {selectedMember && (
          <div className="card relative flex w-full shrink-0 flex-col gap-6 p-6 shadow-sm animate-fade-in lg:w-80">
            {/* Close */}
            <button
              onClick={() => setSelectedMember(null)}
              aria-label="Close member details"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg
                text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Close size={16} />
            </button>

            {/* Avatar header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar initials={selectedMember.avatar} color={selectedMember.color} size={80} />
              <div>
                <h3 className="m-0 font-display text-[17px] font-bold leading-tight text-slate-900">
                  {selectedMember.name}
                </h3>
                <span className="text-[13px] text-slate-500">{selectedMember.email}</span>
              </div>
              <span className="badge badge-success">Active member</span>
            </div>

            <hr className="m-0 border-0 border-t border-slate-200" />

            {/* Project track info */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Workspaces</label>
              {selectedMember.projects.map(proj => (
                <div key={proj.projectId} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-3 mb-2 shrink-0">
                  <div className="flex justify-between items-center text-sm gap-2">
                    <span className="font-semibold text-slate-900 truncate" title={proj.projectName}>{proj.projectName}</span>
                    <span className="badge badge-info shrink-0">{proj.projectStatus}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
                      <span>Track Completion</span>
                      <span className="font-semibold text-slate-900">{proj.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-[width] duration-500 ease-out"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="m-0 border-0 border-t border-slate-200" />

            {/* Rendered as a real anchor — this was previously <Button as="a">,
                which React rendered as a <button> with a stray `as` attribute,
                so the mailto link never fired. */}
            <a
              href={`mailto:${selectedMember.email}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-600
                bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-xs
                transition-colors duration-150 hover:border-brand-700 hover:bg-brand-700"
            >
              <Mail size={16} /> Email mentee
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
