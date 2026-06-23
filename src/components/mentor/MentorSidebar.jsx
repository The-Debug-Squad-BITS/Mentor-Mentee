import Avatar from "../ui/Avatar";
import { useAuthStore } from "../../store/authStore";

export function MentorSidebarToggle({ onClick, mobileOpen }) {
  if (mobileOpen) return null;
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-200 w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center cursor-pointer"
      style={{ boxShadow: "0 2px 12px rgba(99,102,241,0.1)" }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1e293b"
        strokeWidth="2.5"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
}

export default function MentorSidebar({
  activeNav,
  setActiveNav,
  mobileOpen,
  setMobileOpen,
}) {
  const handleNavClick = (item) => {
    setActiveNav(item);
    setMobileOpen(false); // close drawer on mobile after selection
  };

  const { user } = useAuthStore();
  const currentUser = user || {
    name: "Sarah Connor",
    role: "MENTOR",
    avatar: "SC",
    color: "#6366f1"
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
      name: "My Projects",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      name: "Tasks",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    },
    {
      name: "Team",
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
      name: "Reviews",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
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
      name: "Profile",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile backdrop — tap to close */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-90 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "bg-white border-r border-slate-100 flex flex-col fixed top-0 left-0 bottom-0 z-100 transition-all duration-300",
          "w-65",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:w-55",
          "lg:w-64",
        ].join(" ")}
        style={{ boxShadow: "2px 0 20px rgba(99,102,241,0.06)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 md:px-4 lg:px-6 pb-7 pt-7">
          <div
            className="w-9 h-9 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-white font-black text-[16px] lg:text-lg shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            M
          </div>
          <span className="font-black text-[17px] md:text-[16px] lg:text-xl text-slate-800 tracking-tight truncate">
            MentorFlow
          </span>
          {/* Close button — mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden ml-auto shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
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
          <div className="text-[11px] font-bold text-slate-400 tracking-[1.2px] mb-4 pl-2 uppercase">
            MAIN WORKSPACE
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
                      ? "linear-gradient(135deg, #6366f1, #818cf8)"
                      : "transparent",
                    color: active ? "#fff" : "#64748b",
                    boxShadow: active
                      ? "0 4px 14px rgba(99,102,241,0.25)"
                      : "none",
                    fontFamily: "inherit",
                  }}
                >
                  {icon}
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom user */}
        <div className="mx-3 lg:mx-4 pt-3.5 pb-4 border-t border-slate-100 flex items-center gap-3">
          <Avatar initials={currentUser.avatar} color={currentUser.color} size={36} />
          <div className="min-w-0">
            <div className="text-[13px] lg:text-sm font-bold text-slate-800 truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] lg:text-xs text-slate-400">
              Workspace Lead
            </div>
          </div>
          <span className="ml-auto bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-bold shrink-0">
            Active
          </span>
        </div>
      </aside>
    </>
  );
}
