import { useState, useEffect } from "react";

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
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Title block */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 flex justify-between items-center" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">Console Settings</h1>
          <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Customize organization variables, active feature toggles, and system security thresholds.</p>
        </div>
      </div>

      {/* Form Block */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 flex flex-col gap-6" style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.03)" }}>
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-700 text-xs font-bold transition-all duration-300 animate-pulse">
            <span>✅</span> Brand settings saved successfully and synchronized!
          </div>
        )}

        {/* Section 1: Profile */}
        <div>
          <h3 className="m-0 text-sm font-black text-slate-800 uppercase tracking-wider mb-4 text-blue-500">Organization Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Organization Name</label>
              <input
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Custom Slug URL</label>
              <input
                required
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="e.g. acme-corp"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 font-sans"
              />
            </div>
          </div>
        </div>

        <hr className="border-0 border-t border-slate-100 m-0" />

        {/* Section 2: Platform Configurations */}
        <div>
          <h3 className="m-0 text-sm font-black text-slate-800 uppercase tracking-wider mb-4 text-blue-500">Platform Toggles</h3>
          <div className="flex flex-col gap-4">
            {/* Email toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block font-bold text-slate-800 text-xs md:text-sm">Email Notifications</span>
                <span className="block text-slate-400 text-[11px] font-semibold">Issue automated alerts and review summaries to member mailboxes.</span>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotif(!emailNotif)}
                className={`w-11 h-6 rounded-full transition-all relative border border-transparent outline-none cursor-pointer flex items-center ${
                  emailNotif ? "bg-blue-500" : "bg-slate-200"
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all absolute ${emailNotif ? "left-[18px]" : "left-[2px]"}`} />
              </button>
            </div>

            {/* Logs toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block font-bold text-slate-800 text-xs md:text-sm">Audit trail logging</span>
                <span className="block text-slate-400 text-[11px] font-semibold">Store system execution event traces in the local audit workspace.</span>
              </div>
              <button
                type="button"
                onClick={() => setSystemLog(!systemLog)}
                className={`w-11 h-6 rounded-full transition-all relative border border-transparent outline-none cursor-pointer flex items-center ${
                  systemLog ? "bg-blue-500" : "bg-slate-200"
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all absolute ${systemLog ? "left-[18px]" : "left-[2px]"}`} />
              </button>
            </div>
          </div>
        </div>

        <hr className="border-0 border-t border-slate-100 m-0" />

        {/* Section 3: Security */}
        <div>
          <h3 className="m-0 text-sm font-black text-slate-800 uppercase tracking-wider mb-4 text-blue-500">Security Thresholds</h3>
          <div className="w-full sm:w-64">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Session Expiry Timeout</label>
            <select
              value={sessionExpiry}
              onChange={(e) => setSessionExpiry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 bg-white"
              style={{ fontFamily: "inherit" }}
            >
              <option value="1h">1 Hour (High Security)</option>
              <option value="8h">8 Hours</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days (Default)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="self-start bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl border-none text-xs cursor-pointer transition-colors shadow-lg shadow-blue-500/20 mt-2"
          style={{ fontFamily: "inherit" }}
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
}
