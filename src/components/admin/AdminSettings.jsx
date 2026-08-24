import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { Check } from "../ui/Icons";

/* Presentational toggle row — label, supporting copy and a switch. */
function ToggleRow({ label, description, checked, onToggle }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-slate-100 last:border-b-0 last:pb-0 first:pt-0">
      <div>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-[13px] text-slate-500 mt-0.5 leading-relaxed max-w-md">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onToggle}
        className={
          "relative shrink-0 mt-0.5 w-11 h-6 rounded-full border transition-colors duration-150 " +
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 " +
          (checked
            ? "bg-brand-600 border-brand-600"
            : "bg-slate-200 border-slate-300 hover:bg-slate-300")
        }
      >
        <span
          className={
            "absolute top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-[left] duration-150 " +
            (checked ? "left-[22px]" : "left-[2px]")
          }
        />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const [orgName, setOrgName] = useState("Acme Corporation");
  const [orgSlug, setOrgSlug] = useState("acme-corp");
  const [emailNotif, setEmailNotif] = useState(true);
  const [systemLog, setSystemLog] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState("24h");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("mentorFlow_settings_orgName") || "Acme Corporation";
    const savedSlug = localStorage.getItem("mentorFlow_settings_orgSlug") || "acme-corp";
    const savedEmail = localStorage.getItem("mentorFlow_settings_emailNotif") !== "false";
    const savedLog = localStorage.getItem("mentorFlow_settings_systemLog") !== "false";
    const savedSession = localStorage.getItem("mentorFlow_settings_sessionExpiry") || "24h";

    setOrgName(savedName);
    setOrgSlug(savedSlug);
    setEmailNotif(savedEmail);
    setSystemLog(savedLog);
    setSessionExpiry(savedSession);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("mentorFlow_settings_orgName", orgName);
    localStorage.setItem("mentorFlow_settings_orgSlug", orgSlug.toLowerCase().replace(/\s+/g, "-"));
    localStorage.setItem("mentorFlow_settings_emailNotif", emailNotif.toString());
    localStorage.setItem("mentorFlow_settings_systemLog", systemLog.toString());
    localStorage.setItem("mentorFlow_settings_sessionExpiry", sessionExpiry);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle mt-1">
          Manage your organization profile, platform preferences and session security.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {savedSuccess && (
          <div className="notice notice-success animate-slide-up">
            <Check size={16} />
            <span>Brand settings saved successfully and synchronized!</span>
          </div>
        )}

        {/* Organization profile */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="section-title">Organization profile</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">
                How your organization is identified across the workspace.
              </p>
            </div>
          </div>
          <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="field-label">Organization name</label>
              <input
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Corporation"
                className="input-field"
              />
            </div>
            <div>
              <label className="field-label">Workspace slug</label>
              <input
                required
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="acme-corp"
                className="input-field"
              />
              <p className="field-hint">Lowercase letters and dashes. Spaces are converted on save.</p>
            </div>
          </div>
        </section>

        {/* Platform preferences */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="section-title">Platform preferences</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Control what the platform sends out and what it records.
              </p>
            </div>
          </div>
          <div className="card-body pt-1 pb-2">
            <ToggleRow
              label="Email notifications"
              description="Send automated alerts and review summaries to member mailboxes."
              checked={emailNotif}
              onToggle={() => setEmailNotif(!emailNotif)}
            />
            <ToggleRow
              label="Audit trail logging"
              description="Record system events so they can be reviewed in the activity log."
              checked={systemLog}
              onToggle={() => setSystemLog(!systemLog)}
            />
          </div>
        </section>

        {/* Security */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="section-title">Security</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Decide how long a signed-in session stays valid before it expires.
              </p>
            </div>
          </div>
          <div className="card-body">
            <div className="w-full sm:max-w-xs">
              <label className="field-label">Session expiry</label>
              <select
                value={sessionExpiry}
                onChange={(e) => setSessionExpiry(e.target.value)}
                className="select-field"
              >
                <option value="1h">1 hour (highest security)</option>
                <option value="8h">8 hours</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
              </select>
              <p className="field-hint">Shorter sessions ask members to sign in again more often.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  );
}
