import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
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
    <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">
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
                  <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                    {m.projectName}
                  </span>
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
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Workspace</label>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-900 truncate max-w-[150px]">{selectedMember.projectName}</span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-100 px-2 py-0.5 rounded border border-blue-200">{selectedMember.projectStatus}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
                    <span>Track Completion</span>
                    <span className="font-semibold text-slate-900">{selectedMember.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${selectedMember.progress}%` }} />
                  </div>
                </div>
              </div>
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
