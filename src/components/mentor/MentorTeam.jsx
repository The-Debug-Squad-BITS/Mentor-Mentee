import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import { Close, Users, Mail } from "../ui/Icons";
import { useAuthStore } from "../../store/authStore";

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
    // Stubbed until integrated with backend API
    setTeamMembers([]);
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
          {teamMembers.length === 0 ? (
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
                  <span className="block truncate text-[14.5px] font-semibold text-slate-900">
                    {m.name}
                  </span>
                  <span className="mb-2 block truncate text-[12.5px] text-slate-500">
                    {m.email}
                  </span>
                  <span className="badge badge-brand">{m.projectName}</span>
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
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Assigned Workspace
              </span>
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[13.5px] font-semibold text-slate-900">
                    {selectedMember.projectName}
                  </span>
                  <span className="badge badge-info shrink-0">{selectedMember.projectStatus}</span>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-[12.5px] font-medium text-slate-500">
                    <span>Track Completion</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {selectedMember.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-[width] duration-500 ease-out"
                      style={{ width: `${selectedMember.progress}%` }}
                    />
                  </div>
                </div>
              </div>
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
