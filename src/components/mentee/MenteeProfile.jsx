import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";

export default function MenteeProfile() {
  const [profileName, setProfileName] = useState("Emily Davies");
  const [profileEmail, setProfileEmail] = useState("mentee@demo.com");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "1",
    name: "Emily Davies",
    role: "MENTEE",
    email: "mentee@demo.com",
    avatar: "ED",
    color: "#f472b6"
  };

  useEffect(() => {
    setProfileName(currentUser.name);
    setProfileEmail(currentUser.email || "mentee@demo.com");
  }, [currentUser]);

  const handleSave = (e) => {
    e.preventDefault();
    // Stubbed until integrated with backend API
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const tasksList = [];
  const totalTasks = 0;
  const completedTasks = 0;

  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Student Profile</h1>
          <p className="m-0 mt-1 text-slate-500 text-sm">Review your study console parameters and credentials.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon="📋"
          label="Tasks Assigned"
          value={totalTasks.toString()}
          badge="Curriculum tracks"
          badgeColor="blue"
        />
        <StatCard
          icon="✓"
          label="Tasks Completed"
          value={completedTasks.toString()}
          badge="Completed Milestones"
          badgeColor="green"
        />
        <StatCard
          icon="📈"
          label="Overall Progress"
          value={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`}
          badge="Track progress"
          badgeColor="blue"
        />
      </div>

      {/* Settings form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col gap-8 shadow-sm">
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium p-4 rounded-lg animate-pulse flex items-center gap-3">
            <span>✅</span> Profile updated successfully! Changes will take effect on next reload.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Avatar initials={currentUser.avatar} color={currentUser.color} size={64} />
          <div>
            <span className="block font-bold text-slate-900 text-lg">{currentUser.name}</span>
            <span className="block text-slate-500 text-xs font-semibold uppercase">{currentUser.role} ACCESS LEVEL</span>
          </div>
        </div>

        <hr className="border-0 border-t border-slate-200 m-0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Student Name</label>
            <input
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Access Email Address</label>
            <input
              required
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <Button type="submit" className="px-6 py-2.5 text-sm font-medium">
            Save Profile Updates
          </Button>
        </div>
      </form>
    </div>
  );
}
