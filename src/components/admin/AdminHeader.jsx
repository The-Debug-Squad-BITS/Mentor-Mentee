import NotificationBell from "../ui/NotificationBell";

export default function AdminHeader({ onAddUser, userName, onLogout }) {
  return (
    <div className="flex justify-between items-start mb-5 md:mb-6 lg:mb-7 gap-3">
      {/* Title + greeting */}
      <div>
        <h1 className="text-[20px] md:text-[24px] lg:text-[28px] font-black text-[#1e293b] m-0 tracking-[-1px]">
          SYSTEM OVERVIEW
        </h1>
        <p className="text-[#64748b] mt-1.5 text-[12px] md:text-[13px] lg:text-[15px]">
          {userName
            ? `Welcome, ${userName} — manage platform operations, users, and analytics.`
            : "Manage platform operations, users, and analytics."}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />

        {/* Logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-500 rounded-xl
              px-3 py-2 text-[11px]
              md:px-4 md:py-2.5 md:text-[12px]
              font-semibold cursor-pointer transition-colors duration-150 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            style={{ fontFamily: "inherit" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        )}

        {/* Add user button */}
        <button
          onClick={onAddUser}
          className="flex items-center gap-2 text-white border-none rounded-xl
            px-3 py-2 text-[11px]
            md:px-4 md:py-2.5 md:text-[12px]
            lg:px-5.5 lg:py-3 lg:text-[14px]
            font-bold cursor-pointer transition-transform duration-150 hover:-translate-y-px shrink-0"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
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
          <span className="hidden sm:inline">ADD NEW USER</span>
          <span className="sm:hidden">ADD</span>
        </button>
      </div>
    </div>
  );
}
