import NotificationBell from "../ui/NotificationBell";
import Button from "../ui/Button";
import { LogOut, Users } from "../ui/Icons";

export default function MentorHeader({ userName, onNewUser, onLogout }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 lg:mb-8">
      {/* Title + Mentor Name */}
      <div className="min-w-0">
        <h1 className="page-title">Mentor Dashboard</h1>
        {userName && (
          <p className="page-subtitle mt-1">
            Signed in as{" "}
            <span className="font-semibold text-slate-900">{userName}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />

        {/* Logout button */}
        {onLogout && (
          <Button variant="ghost" onClick={onLogout} title="Log out of Mentora">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        )}

        {/* Add user button */}
        <Button onClick={onNewUser}>
          <Users size={16} />
          <span className="hidden sm:inline">New User</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
}
