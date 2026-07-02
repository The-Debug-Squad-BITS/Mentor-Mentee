import NotificationBell from "../ui/NotificationBell";
import Button from "../ui/Button";

export default function MentorHeader({ userName, onNewUser, onLogout }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 lg:mb-8 pl-0 md:pl-4 lg:pl-8 gap-4">
      {/* Title + Mentor Name */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 m-0 tracking-tight">
          Mentor Dashboard
        </h1>
        {userName && (
          <p className="text-slate-500 mt-1 text-sm">
            Signed in as <span className="text-slate-900 font-semibold">{userName}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <NotificationBell />
        
        {/* Logout button */}
        {onLogout && (
          <Button variant="ghost" onClick={onLogout} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-900 font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline font-semibold">Logout</span>
          </Button>
        )}

        {/* Add user button */}
        <Button onClick={onNewUser} className="text-sm px-4 py-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mr-1.5"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          <span className="hidden sm:inline">New User</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  );
}
