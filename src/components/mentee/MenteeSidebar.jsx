import Avatar from "../ui/Avatar";
import { useAuthStore } from "../../store/authStore";

export function MenteeSidebarToggle({ onClick, mobileOpen }) {
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

export default function MenteeSidebar({
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
    name: "Emily Davies",
    role: "MENTEE",
    avatar: "ED",
    color: "#f472b6"
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
      name: "My Tasks",
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
      name: "My Projects",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      name: "Feedback",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
      name: "Messages",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      name: "Meetings",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
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
            M
          </div>
          <span className="font-bold text-[17px] md:text-[16px] lg:text-[18px] text-white tracking-tight truncate">
            MenteeHub
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
            My Study Desk
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

        {/* Bottom user */}
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
              Student Track
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
