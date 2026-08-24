// SidebarToggle.jsx
// Hamburger button — only on mobile, only when sidebar is closed

import { Menu } from "../ui/Icons";

export default function SidebarToggle({ onClick, mobileOpen }) {
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
