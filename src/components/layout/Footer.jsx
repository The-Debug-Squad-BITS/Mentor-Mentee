import { useNavigate } from "react-router-dom";
import Brand from "../ui/Brand";
import { footerTagline, footerNav } from "../../data/landingData";

/* ==========================================================================
   Footer — brand, section navigation and the two real entry points.
   --------------------------------------------------------------------------
   Every link here goes somewhere: the nav columns are in-page anchors, and
   Sign in / Get Started are real routes. The previous footer linked to
   "Privacy Policy", "Terms of Service" and "Status" with href="#", none of
   which exist — those are gone rather than left as dead ends.
   ========================================================================== */

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <Brand size="md" />
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-slate-600">{footerTagline}</p>
          </div>

          {/* Section navigation */}
          {footerNav.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {column.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[13.5px] text-slate-600 transition-colors duration-150 hover:text-slate-900"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Entry points */}
          <nav aria-label="Account">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Get started
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <button
                  onClick={() => navigate("/login")}
                  className="text-[13.5px] text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  Sign in
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/signup")}
                  className="text-[13.5px] text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  Create an account
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-[12.5px] text-slate-500">
            &copy; {new Date().getFullYear()} Trellis. Academic project and capstone supervision.
          </p>
        </div>
      </div>
    </footer>
  );
}
