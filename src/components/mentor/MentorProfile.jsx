import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import StatCard from "../ui/StatCard";
import { useAuthStore } from "../../store/authStore";

export default function MentorProfile() {
  const [profileName, setProfileName] = useState("Sarah Connor");
  const [profileEmail, setProfileEmail] = useState("mentor@demo.com");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "2",
    name: "Sarah Connor",
    role: "MENTOR",
    email: "mentor@demo.com",
    avatar: "SC",
    color: "#6366f1"
  };

  useEffect(() => {
    setProfileName(currentUser.name);
    setProfileEmail(currentUser.email || "mentor@demo.com");
  }, [currentUser]);

  const handleSave = (e) => {
    e.preventDefault();
    // Stubbed until integrated with backend API
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const mentoredProjects = [];
  const totalTasks = 0;
  const completedTasks = 0;

  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-fade-in pl-0 md:pl-4 lg:pl-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 flex justify-between items-center bg-slate-50/20" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">Advisor Profile</h1>
          <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Manage your system profile settings and view academic advisory metrics.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon="📁"
          label="Supervised Projects"
          value={mentoredProjects.length.toString()}
          badge="Workspace Led"
          badgeColor="blue"
        />
        <StatCard
          icon="📋"
          label="Milestones Created"
          value={totalTasks.toString()}
          badge="Tasks Dispatched"
          badgeColor="green"
        />
        <StatCard
          icon="⭐"
          label="Track Completion"
          value={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`}
          badge="Efficiency rate"
          badgeColor="blue"
        />
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 flex flex-col gap-6" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold p-4 rounded-2xl animate-pulse">
            ✅ Profile updated successfully! Changes will take effect on next reload.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Avatar initials={currentUser.avatar} color={currentUser.color} size={64} />
          <div>
            <span className="block font-black text-slate-800 text-base">{currentUser.name}</span>
            <span className="block text-slate-400 text-xs font-semibold uppercase">{currentUser.role} ACCESS LEVEL</span>
          </div>
        </div>

        <hr className="border-0 border-t border-slate-100 m-0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Advisor Name</label>
            <input
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 font-sans"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Advisor Email Address</label>
            <input
              required
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 font-sans"
            />
          </div>
        </div>

        <button
          type="submit"
          className="self-start bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl border-0 text-xs cursor-pointer transition-colors shadow-lg shadow-indigo-500/20 mt-2"
          style={{ fontFamily: "inherit" }}
        >
          Save Profile Updates
        </button>
      </form>
    </div>
  );
}
