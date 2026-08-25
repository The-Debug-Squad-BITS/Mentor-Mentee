import NotificationBell from "../ui/NotificationBell";
import Button from "../ui/Button";
import { LogOut, MessageSquare, Calendar } from "../ui/Icons";

export default function MenteeHeader({ activeNav, onMessageMentor, userName, onLogout }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 lg:mb-8">
      {/* Title */}
      <div className="min-w-0">
        <h1 className="page-title">
          {activeNav === "Dashboard" ? "My Dashboard" : activeNav}
        </h1>
        <p className="page-subtitle mt-1">
          {userName
            ? `Welcome, ${userName} — track your progress, manage tasks, and connect with your mentors.`
            : "Track your progress, manage tasks, and connect with your mentors."}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <NotificationBell />

        {/* Logout button */}
        {onLogout && (
          <Button variant="ghost" onClick={onLogout} title="Log out of Trellis">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        )}

        {/* Message Mentor */}
        <Button variant="secondary" onClick={onMessageMentor}>
          <MessageSquare size={16} />
          <span className="hidden sm:inline">Message Mentor</span>
          <span className="sm:hidden">Message</span>
        </Button>

        {/* Request Meeting */}
        <Button>
          <Calendar size={16} />
          <span className="hidden sm:inline">Request Meeting</span>
          <span className="sm:hidden">Meeting</span>
        </Button>
      </div>
    </header>
  );
}
