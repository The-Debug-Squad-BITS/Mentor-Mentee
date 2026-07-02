import { useState, useEffect } from "react";
import Button from "../ui/Button";

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

    // db log stubbed
    
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-fade-in">
      {/* Title block */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Console Settings</h1>
          <p className="m-0 mt-1 text-slate-500 text-sm">Customize organization variables, active feature toggles, and system security thresholds.</p>
        </div>
      </div>

      {/* Form Block */}
      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 flex flex-col gap-8 shadow-sm">
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium transition-all duration-300 animate-pulse">
            <span>✅</span> Brand settings saved successfully and synchronized!
          </div>
        )}

        {/* Section 1: Profile */}
        <div>
          <h3 className="m-0 text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Organization Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Organization Name</label>
              <input
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Custom Slug URL</label>
              <input
                required
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="e.g. acme-corp"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Platform Configurations */}
        <div>
          <h3 className="m-0 text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Platform Toggles</h3>
          <div className="flex flex-col gap-5 mt-4">
            {/* Email toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block font-semibold text-slate-900 text-sm">Email Notifications</span>
                <span className="block text-slate-500 text-sm mt-0.5">Issue automated alerts and review summaries to member mailboxes.</span>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotif(!emailNotif)}
                className={`w-11 h-6 rounded-full transition-all relative border border-transparent outline-none cursor-pointer flex items-center ${
                  emailNotif ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all absolute ${emailNotif ? "left-[18px]" : "left-[2px]"}`} />
              </button>
            </div>

            {/* Logs toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block font-semibold text-slate-900 text-sm">Audit Trail Logging</span>
                <span className="block text-slate-500 text-sm mt-0.5">Store system execution event traces in the local audit workspace.</span>
              </div>
              <button
                type="button"
                onClick={() => setSystemLog(!systemLog)}
                className={`w-11 h-6 rounded-full transition-all relative border border-transparent outline-none cursor-pointer flex items-center ${
                  systemLog ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all absolute ${systemLog ? "left-[18px]" : "left-[2px]"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Security */}
        <div>
          <h3 className="m-0 text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Security Thresholds</h3>
          <div className="w-full sm:w-64 mt-4">
            <label className="block text-xs font-semibold text-slate-700 mb-2">Session Expiry Timeout</label>
            <select
              value={sessionExpiry}
              onChange={(e) => setSessionExpiry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
            >
              <option value="1h">1 Hour (High Security)</option>
              <option value="8h">8 Hours</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days (Default)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <Button type="submit" className="px-6 py-2.5 text-sm font-medium">
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
