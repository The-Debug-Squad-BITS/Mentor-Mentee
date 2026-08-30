import NotificationBell from "../ui/NotificationBell";
import Button from "../ui/Button";
import { LogOut } from "../ui/Icons";
import { pageMeta } from "../../lib/pageMeta";

export default function MentorHeader({ activeNav, userName, onLogout }) {
  const { title, subtitle } = pageMeta("MENTOR", activeNav, userName);

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 lg:mb-8">
      {/* Title */}
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle mt-1">{subtitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />

        {/* Logout button */}
        {onLogout && (
          <Button variant="ghost" onClick={onLogout} title="Log out of Trellis">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        )}
      </div>
    </header>
  );
}
