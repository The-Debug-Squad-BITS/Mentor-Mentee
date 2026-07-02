import NotificationBell from "../ui/NotificationBell";
import Button from "../ui/Button";

export default function MenteeHeader({ activeNav, onMessageMentor, userName, onLogout }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 lg:mb-8 gap-4">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 m-0 tracking-tight capitalize">
          {activeNav === "Dashboard" ? "My Dashboard" : activeNav}
        </h1>
        <p className="text-slate-500 mt-1 text-sm md:text-[15px]">
          {userName
            ? `Welcome, ${userName} — track your progress, manage tasks, and connect with your mentors.`
            : "Track your progress, manage tasks, and connect with your mentors."}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <NotificationBell />

        {/* Logout button */}
        {onLogout && (
          <Button variant="ghost" onClick={onLogout} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline font-semibold">Logout</span>
          </Button>
        )}

        {/* Message Mentor */}
        <Button variant="secondary" onClick={onMessageMentor} className="text-sm">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="hidden sm:inline">Message Mentor</span>
          <span className="sm:hidden">Message</span>
        </Button>

        {/* Request Meeting */}
        <Button className="text-sm">
          <svg
            width="16"
            height="16"
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
        </Button>
      </div>
    </div>
  );
}
