import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";
import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import { Folder, FileText, BarChart, Check, AlertCircle } from "../ui/Icons";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";

export default function MentorProfile() {
  const [profileName, setProfileName] = useState("Sarah Connor");
  const [profileEmail, setProfileEmail] = useState("mentor@demo.com");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const { user, updateUser } = useAuthStore();
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

  /* PATCH /auth/me is the self-service endpoint: it only ever writes the
     caller's own name. PATCH /users/:id is deliberately not used here — it is
     coordinator-only and can change a role. */
  const handleSave = async (e) => {
    e.preventDefault();
    const trimmed = profileName.trim();

    setSaveSuccess(false);
    setSaveError(null);

    if (!trimmed) {
      setSaveError("Please enter your name.");
      return;
    }
    if (trimmed === (currentUser.name || "").trim()) {
      setSaveError("That is already your name — nothing to save.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch("/auth/me", { name: trimmed });
      const updated = res.data?.data?.user;

      /* Keep the persisted session in step so the sidebar, header and avatar
         show the new name immediately rather than after the next sign-in. */
      updateUser({ name: updated?.name ?? trimmed });
      setProfileName(updated?.name ?? trimmed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      const fieldError = err.response?.data?.errors?.[0]?.message;
      setSaveError(fieldError || err.userMessage || "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const mentoredProjects = [];
  const totalTasks = 0;
  const completedTasks = 0;

  return (
    <div className="flex max-w-3xl flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title m-0">Advisor Profile</h1>
        <p className="page-subtitle mt-1">
          Your account details and a snapshot of your advisory work.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-wrap gap-4">
        <StatCard
          icon={<Folder size={17} />}
          label="Supervised Projects"
          value={mentoredProjects.length.toString()}
          badge="Workspace Led"
          badgeColor="blue"
        />
        <StatCard
          icon={<FileText size={17} />}
          label="Milestones Created"
          value={totalTasks.toString()}
          badge="Tasks Dispatched"
          badgeColor="green"
        />
        <StatCard
          icon={<BarChart size={17} />}
          label="Track Completion"
          value={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`}
          badge="Efficiency rate"
          badgeColor="blue"
        />
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="card flex flex-col gap-7 p-6 md:p-8">
        {saveSuccess && (
          <div className="notice notice-success animate-fade-in" role="status">
            <Check size={16} className="mt-px shrink-0" />
            <span>Your name has been updated.</span>
          </div>
        )}

        {saveError && (
          <div className="notice notice-danger animate-fade-in" role="alert">
            <AlertCircle size={16} className="mt-px shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <Avatar initials={currentUser.avatar} color={currentUser.color} size={80} />
          <div className="text-center sm:text-left">
            <span className="block font-display text-xl font-bold text-slate-900">
              {currentUser.name}
            </span>
            <span className="badge badge-brand mt-2">{currentUser.role} access</span>
          </div>
        </div>

        <hr className="m-0 border-0 border-t border-slate-200" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label">Advisor Name</label>
            <input
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="field-label">Advisor Email Address</label>
            <input
              required
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="input-field"
              disabled // usually emails aren't editable directly like this, or maybe they are, but giving it a disabled look for safety if not mapped to a backend yet
            />
            <p className="field-hint">Contact an administrator to change your sign-in email.</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Profile Updates"}
          </Button>
        </div>
      </form>
    </div>
  );
}
