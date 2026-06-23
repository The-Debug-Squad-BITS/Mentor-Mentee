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
          className="md:hidden fixed inset-0 bg-black/30 z-90 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "bg-white border-r border-[#f1f5f9] flex flex-col fixed top-0 left-0 bottom-0 z-100 transition-all duration-300",
          "w-65",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:w-55",
          "lg:w-65",
        ].join(" ")}
        style={{ boxShadow: "2px 0 20px rgba(59,130,246,0.05)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 md:px-4 lg:px-6 pb-7 pt-7">
          <div
            className="w-9 h-9 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-white font-black text-[16px] lg:text-[18px] shrink-0"
            style={{ background: "linear-gradient(135deg, #1e293b, #334155)" }}
          >
            A
          </div>
          <span className="font-black text-[17px] md:text-[16px] lg:text-[20px] text-[#1e293b] tracking-[-0.5px] truncate">
            AdminConsole
          </span>
          {/* Close button — mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden ml-auto shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#1e293b] hover:bg-slate-100 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <div className="px-3 md:px-3 lg:px-4 flex-1 overflow-y-auto">
          <div className="text-[11px] font-bold text-[#94a3b8] tracking-[1.2px] mb-4 pl-2 uppercase">
            ADMIN PANEL
          </div>

          <div className="flex flex-col gap-1.5">
            {menuItems.map(({ name, icon }) => {
              const active = activeNav === name;
              return (
                <button
                  key={name}
                  onClick={() => handleNavClick(name)}
                  className="flex items-center gap-3 w-full px-3.5 py-3 border-none rounded-xl cursor-pointer text-[13px] md:text-[12px] lg:text-sm font-bold transition-all duration-200"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #3b82f6, #60a5fa)"
                      : "transparent",
                    color: active ? "#fff" : "#64748b",
                    boxShadow: active
                      ? "0 4px 14px rgba(59,130,246,0.2)"
                      : "none",
                    fontFamily: "inherit"
                  }}
                >
                  {icon}
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* User strip */}
        <div className="mx-3 lg:mx-4 pt-3.5 pb-4 border-t border-[#f1f5f9] flex items-center gap-3">
          <Avatar initials={currentUser.avatar} color={currentUser.color} size={36} />
          <div className="min-w-0">
            <div className="text-[13px] lg:text-[14px] font-bold text-[#1e293b] truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] lg:text-[12px] text-[#94a3b8]">
              Master Access
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
