import NotificationBell from "../ui/NotificationBell";
import Button from "../ui/Button";
import { LogOut, Users } from "../ui/Icons";

export default function AdminHeader({ onAddUser, userName, onLogout }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 lg:mb-8">
      {/* Title + greeting */}
      <div className="min-w-0">
        <h1 className="page-title">System Overview</h1>
        <p className="page-subtitle mt-1">
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
          <Button variant="ghost" onClick={onLogout} title="Log out of Mentora">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        )}

        {/* Add user button */}
        <Button onClick={onAddUser}>
          <Users size={16} />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
}
