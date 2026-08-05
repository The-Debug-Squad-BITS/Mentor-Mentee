import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
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
    <div className="flex flex-col gap-6 max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Advisor Profile</h1>
          <p className="m-0 mt-1 text-slate-500 text-sm">Manage your system profile settings and view academic advisory metrics.</p>
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
          badgeColor="emerald"
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
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold p-4 rounded-lg animate-fade-in">
            ✅ Profile updated successfully! Changes will take effect on next reload.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <Avatar initials={currentUser.avatar} color={currentUser.color} size={80} />
          <div className="text-center sm:text-left">
            <span className="block font-bold text-slate-900 text-lg md:text-xl">{currentUser.name}</span>
            <span className="inline-block mt-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200">{currentUser.role} ACCESS LEVEL</span>
          </div>
        </div>

        <hr className="border-0 border-t border-slate-200 m-0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Advisor Name</label>
            <input
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Advisor Email Address</label>
            <input
              required
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-slate-50"
              disabled // usually emails aren't editable directly like this, or maybe they are, but giving it a disabled look for safety if not mapped to a backend yet
            />
          </div>
        </div>

        <Button
          type="submit"
          className="self-start mt-2 px-6 py-2.5"
        >
          Save Profile Updates
        </Button>
      </form>
    </div>
  );
}
