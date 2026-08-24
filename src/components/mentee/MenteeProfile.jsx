import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import { FileText, CheckCircle, BarChart, Check } from "../ui/Icons";
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
    <div className="flex max-w-3xl flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title m-0">Student Profile</h1>
        <p className="page-subtitle mt-1">
          Your account details and a snapshot of your progress.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-wrap gap-4">
        <StatCard
          icon={<FileText size={17} />}
          label="Tasks Assigned"
          value={totalTasks.toString()}
          badge="Curriculum tracks"
          badgeColor="blue"
        />
        <StatCard
          icon={<CheckCircle size={17} />}
          label="Tasks Completed"
          value={completedTasks.toString()}
          badge="Completed Milestones"
          badgeColor="green"
        />
        <StatCard
          icon={<BarChart size={17} />}
          label="Overall Progress"
          value={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`}
          badge="Track progress"
          badgeColor="blue"
        />
      </div>

      {/* Settings form */}
      <form onSubmit={handleSave} className="card flex flex-col gap-7 p-6 md:p-8">
        {saveSuccess && (
          <div className="notice notice-success">
            <Check size={16} className="mt-px shrink-0" />
            <span>Profile updated successfully. Changes will take effect on next reload.</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Avatar initials={currentUser.avatar} color={currentUser.color} size={64} />
          <div className="text-center sm:text-left">
            <span className="block font-display text-lg font-bold text-slate-900">
              {currentUser.name}
            </span>
            <span className="badge badge-brand mt-1.5">{currentUser.role} access</span>
          </div>
        </div>

        <hr className="m-0 border-0 border-t border-slate-200" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label">Student Name</label>
            <input
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="field-label">Access Email Address</label>
            <input
              required
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <Button type="submit">Save Profile Updates</Button>
        </div>
      </form>
    </div>
  );
}
