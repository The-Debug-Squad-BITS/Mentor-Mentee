import NotificationBell from "../ui/NotificationBell";

export default function MentorHeader({ userName, onNewUser, onLogout }) {
  return (
    <div className="flex justify-between items-start mb-5 md:mb-6 lg:mb-7 pl-0 md:pl-4 lg:pl-8 gap-3">
      {/* Title + Mentor Name */}
      <div>
        <h1 className="text-[18px] md:text-xl lg:text-2xl font-black text-slate-800 tracking-tight m-0">
          MENTOR DASHBOARD
        </h1>
        {userName && (
          <p className="m-0 mt-0.5 text-slate-400 text-xs font-semibold">
            Signed in as <span className="text-indigo-500 font-bold">{userName}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <NotificationBell />
        <button
          onClick={onNewUser}
          className="flex items-center gap-1.5 md:gap-2 text-white border-0 rounded-xl
            px-3 py-2 text-[11px]
            md:px-4 md:py-2.5 md:text-xs
            lg:px-5 lg:py-3 lg:text-sm
            font-bold cursor-pointer transition-transform duration-150 hover:-translate-y-px shrink-0"
          style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
            fontFamily: "inherit",
          }}
        >
          <svg
            width="14"
            height="14"
            className="md:w-4 md:h-4 lg:w-4.5 lg:h-4.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          <span className="hidden sm:inline">NEW USER</span>
          <span className="sm:hidden">ADD</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-slate-200 hover:border-red-300 text-slate-500 hover:text-red-500 text-[11px] md:text-xs font-bold cursor-pointer transition-colors shrink-0"
            style={{ fontFamily: "inherit" }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
