import NotificationBell from "../ui/NotificationBell";

export default function MenteeHeader({ activeNav, onMessageMentor }) {
  return (
    <div className="flex justify-between items-start mb-5 md:mb-6 lg:mb-8 gap-3">
      {/* Title */}
      <div>
        <h1 className="text-[18px] md:text-xl lg:text-2xl font-black text-slate-800 tracking-tight uppercase m-0">
          {activeNav === "Dashboard" ? "My Dashboard" : activeNav}
        </h1>
        <p className="text-slate-500 mt-1.5 text-[11px] md:text-xs lg:text-sm">
          Track your progress, manage tasks, and connect with your mentors.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 md:gap-2.5 lg:gap-3 shrink-0 items-center">
        <NotificationBell />

        {/* Message Mentor */}
        <button
          onClick={onMessageMentor}
          className="flex items-center gap-1.5 md:gap-2 bg-white text-slate-800 border border-slate-200 rounded-xl
            px-2.5 py-2 text-[11px]
            md:px-3.5 md:py-2.5 md:text-xs
            lg:px-4 lg:py-2.5 lg:text-sm
            font-bold cursor-pointer hover:border-slate-300 transition-colors"
          style={{ fontFamily: "inherit" }}
        >
          <svg
            width="14"
            height="14"
            className="md:w-4 md:h-4 lg:w-4.5 lg:h-4.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="hidden sm:inline">Message Mentor</span>
          <span className="sm:hidden">Message</span>
        </button>

        {/* Request Meeting */}
        <button
          className="flex items-center gap-1.5 md:gap-2 text-white border-0 rounded-xl
            px-2.5 py-2 text-[11px]
            md:px-3.5 md:py-2.5 md:text-xs
            lg:px-4 lg:py-2.5 lg:text-sm
            font-bold cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
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
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="hidden sm:inline">Request Meeting</span>
          <span className="sm:hidden">Meeting</span>
        </button>
      </div>
    </div>
  );
}
