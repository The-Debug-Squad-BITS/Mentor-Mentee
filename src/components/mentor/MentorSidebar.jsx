import Avatar from "../ui/Avatar";
import Brand from "../ui/Brand";
import { useAuthStore } from "../../store/authStore";
import {
  Close,
  Menu,
  Dashboard,
  Folder,
  CheckCircle,
  Users,
  FileText,
  Activity,
  MessageSquare,
  Video,
  Calendar,
  Layers,
  User,
} from "../ui/Icons";

/* Presentational helpers — display only, no data is derived or persisted. */
const ROLE_LABELS = {
  ADMIN: "Administrator",
  MENTOR: "Mentor",
  MENTEE: "Student",
};

function initialsOf(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function MentorSidebarToggle({ onClick, mobileOpen }) {
  if (mobileOpen) return null;
  return (
    <button
      onClick={onClick}
      aria-label="Open navigation"
      title="Open navigation"
      className="md:hidden fixed top-4 left-4 z-[200] w-10 h-10 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-colors"
    >
      <Menu size={18} />
    </button>
  );
}

export default function MentorSidebar({
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
    name: "Sarah Connor",
    role: "MENTOR",
    avatar: "SC",
    color: "#6366f1"
  };

  const menuItems = [
    {
      group: "Overview",
      items: [
        { name: "Dashboard", icon: Dashboard },
        { name: "Activity", icon: Activity },
      ],
    },
    {
      group: "Manage",
      items: [
        { name: "My Projects", icon: Folder },
        { name: "Tasks", icon: CheckCircle },
        { name: "Reviews", icon: FileText },
        { name: "Templates", icon: Layers },
      ],
    },
    {
      group: "Collaborate",
      items: [
        { name: "Team", icon: Users },
        { name: "Messages", icon: MessageSquare },
        { name: "Meetings", icon: Video },
        { name: "Calendar", icon: Calendar },
      ],
    },
    {
      group: "Account",
      items: [{ name: "Profile", icon: User }],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-ink-950/50 z-[90] backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "surface-ink flex flex-col fixed top-0 left-0 bottom-0 z-[100]",
          "border-r border-white/[0.06] transition-transform duration-300",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:w-56",
          "lg:w-64",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 h-16 shrink-0 px-4 lg:px-5 border-b border-white/[0.06]">
          <Brand size="lg" tone="dark" subtitle="Mentor workspace" className="min-w-0" />
          {/* Close button — mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            title="Close navigation"
            className="md:hidden ml-auto shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <Close size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-slim px-3 lg:px-4 py-5 flex flex-col gap-6">
          {menuItems.map(({ group, items }) => (
            <div key={group}>
              <div className="nav-group-label">{group}</div>
              <div className="flex flex-col gap-0.5">
                {items.map(({ name, icon: ItemIcon }) => {
                  const active = activeNav === name;
                  return (
                    <button
                      key={name}
                      onClick={() => handleNavClick(name)}
                      aria-current={active ? "page" : undefined}
                      className={`nav-item ${active ? "nav-item-active" : ""}`}
                    >
                      <span className={active ? "text-brand-300" : "text-slate-500"}>
                        <ItemIcon size={18} />
                      </span>
                      <span className="truncate">{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user */}
        <div className="shrink-0 border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar
              initials={initialsOf(currentUser.name)}
              size={34}
              title={currentUser.name}
            />
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-slate-100 truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {ROLE_LABELS[currentUser.role] || currentUser.role}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
