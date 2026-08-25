import { useState } from "react";
import Brand from "../ui/Brand";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { Menu, Close, ArrowRight } from "../ui/Icons";
import { navLinks } from "../../data/landingData";

/* ==========================================================================
   Header — sticky public navigation for the landing page.
   --------------------------------------------------------------------------
   Anchor links scroll to the sections below (html has scroll-behavior:smooth).
   Below `lg` the links and actions collapse into a disclosure panel.
   ========================================================================== */

export default function Header({ onLogin, onSignup }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <a href="#top" className="flex shrink-0 items-center gap-2.5">
            <Brand size="md" />
          </a>

          {/* Section links */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Page sections">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-[13.5px] font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <button
              className="rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-500 underline-offset-4 transition-colors duration-150 hover:text-slate-900 hover:underline"
              onClick={() => navigate("/admin-dashboard")}
            >
              Demo Admin
            </button>

            <Button variant="secondary" size="sm" onClick={() => navigate("/login")}>
              Sign in
            </Button>

            <Button variant="primary" size="sm" onClick={() => navigate("/signup")}>
              Get Started <ArrowRight size={15} />
            </Button>
          </div>

          {/* Mobile disclosure toggle */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-xs transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <Close size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div
          id="landing-mobile-nav"
          className="animate-fade-in border-t border-slate-200 bg-white shadow-lg lg:hidden"
        >
          <div className="mx-auto w-full max-w-6xl px-5 pb-5 pt-3 sm:px-6">
            <nav className="flex flex-col" aria-label="Page sections">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login");
                }}
              >
                Sign in
              </Button>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/signup");
                }}
              >
                Get Started <ArrowRight size={16} />
              </Button>

              <button
                className="mt-1 self-center rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-500 underline-offset-4 transition-colors duration-150 hover:text-slate-900 hover:underline"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/admin-dashboard");
                }}
              >
                Demo Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
