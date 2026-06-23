import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
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
      <div className="bg-white rounded-3xl p-6 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">Mentees Directory</h1>
        <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Review member details and progress charts for team members under your supervision.</p>
      </div>

      {/* Grid List */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {teamMembers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center text-slate-400 text-xs font-semibold w-full">
              No mentees currently assigned to your projects.
            </div>
          ) : (
            teamMembers.map(m => (
              <div
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className={`bg-white border border-slate-100 rounded-3xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-500/5 duration-200 ${
                  selectedMember && selectedMember.id === m.id ? "bg-indigo-50/20" : ""
                }`}
                style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}
              >
                <Avatar initials={m.avatar} color={m.color} size={40} />
                <div className="min-w-0 flex-1">
                  <span className="block font-black text-slate-800 text-xs md:text-sm truncate">{m.name}</span>
                  <span className="block text-[11px] text-slate-400 font-semibold truncate mb-1">{m.email}</span>
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-extrabold uppercase">
                    {m.projectName}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Member Profile Drawer */}
        {selectedMember && (
          <div
            className="w-full lg:w-80 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-6 shrink-0 relative animate-fade-in"
            style={{ boxShadow: "0 4px 20px rgba(99,102,241,0.06)" }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center cursor-pointer border-none text-sm transition-colors"
            >
              ✕
            </button>

            {/* Avatar header */}
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar initials={selectedMember.avatar} color={selectedMember.color} size={64} />
              <div>
                <h3 className="m-0 text-base font-black text-slate-800 leading-tight">{selectedMember.name}</h3>
                <span className="text-slate-400 text-xs font-semibold">{selectedMember.email}</span>
              </div>
              <span className="px-3 py-0.5 bg-green-50 border border-green-100 text-green-700 text-[10px] font-extrabold uppercase tracking-wide rounded-full">
                Active Member
              </span>
            </div>

            <hr className="border-0 border-t border-slate-100 m-0" />

            {/* Project track info */}
            <div className="flex flex-col gap-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assigned Work Space</label>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 truncate max-w-[150px]">{selectedMember.projectName}</span>
                  <span className="text-[10px] font-extrabold text-blue-500 uppercase">{selectedMember.projectStatus}</span>
                </div>
                <div className="mt-1">
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-1">
                    <span>TRACK COMPLETION</span>
                    <span>{selectedMember.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedMember.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-0 border-t border-slate-100 m-0" />

            <a
              href={`mailto:${selectedMember.email}`}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              style={{ fontFamily: "inherit", textDecoration: "none" }}
            >
              ✉️ Send Workspace Alert
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
