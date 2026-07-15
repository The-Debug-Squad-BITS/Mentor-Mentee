import Avatar from "../ui/Avatar";
import { useAuthStore } from "../../store/authStore";

export { default as SidebarToggle } from "./SidebarToggle";

export default function AdminSidebar({
  activeNav,
  setActiveNav,
  mobileOpen,
  setMobileOpen,
}) {
  const { user } = useAuthStore();
  const currentUser = user || {
    name: "System Admin",
    role: "ADMIN",
    avatar: "AD",
    color: "#1e293b"
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    {
      name: "Projects",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      name: "Members",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      name: "Invitations",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      )
    },
    {
      name: "Activity",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      name: "Templates",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 12h6M9 15h4" />
        </svg>
      )
    },
    {
      name: "Settings",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    }
  ];

  const handleNavClick = (name) => {
    setActiveNav(name);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/50 z-90 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "bg-[#0B1120] text-slate-300 flex flex-col fixed top-0 left-0 bottom-0 z-100 transition-transform duration-300",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:w-56",
          "lg:w-64",
        ].join(" ")}
        style={{ boxShadow: "4px 0 24px rgba(0,0,0,0.2)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 md:px-4 lg:px-6 pb-6 pt-6">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 bg-blue-600 shadow-sm"
          >
            A
          </div>
          <span className="font-bold text-[17px] md:text-[16px] lg:text-[18px] text-white tracking-tight truncate">
            AdminConsole
          </span>
          {/* Close button — mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden ml-auto shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <div className="px-3 md:px-3 lg:px-4 flex-1 overflow-y-auto mt-2">
          <div className="text-[10px] font-bold text-slate-500 tracking-widest mb-3 pl-3 uppercase">
            Admin Panel
          </div>

          <div className="flex flex-col gap-1">
            {menuItems.map(({ name, icon }) => {
              const active = activeNav === name;
              return (
                <button
                  key={name}
                  onClick={() => handleNavClick(name)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg cursor-pointer text-[13px] lg:text-sm font-medium transition-colors duration-150 border-0 ${
                    active 
                      ? "bg-blue-600/10 text-blue-500 font-semibold" 
                      : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                  style={{ fontFamily: "inherit" }}
                >
                  <span className={`${active ? "text-blue-500" : "text-slate-500"}`}>
                    {icon}
                  </span>
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* User strip */}
        <div className="mx-4 mt-auto mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-3 hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-slate-200 truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-500">
              Master Access
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
