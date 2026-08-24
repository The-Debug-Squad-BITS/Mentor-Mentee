import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { connectSocket } from "./lib/socket";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Lock, ArrowRight } from "./components/ui/Icons";

// Pages
import LandingPage        from "./pages/LandingPage";
import LoginPage          from "./pages/LoginPage";
import SignupPage         from "./pages/SignupPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminDashboard     from "./pages/AdminDashboard";
import MentorDashboard    from "./pages/MentorDashboard";
import MenteeDashboard    from "./pages/MenteeDashboard";

// ── ProtectedRoute ─────────────────────────────────────────────────────────
// Redirects to /login if not authenticated.
// Redirects to /unauthorized if role is not in allowedRoles.
function ProtectedRoute({ element, allowedRoles }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Force temp-password users to /change-password before accessing any dashboard.
  // Skip this check when we're already rendering the ChangePasswordPage itself.
  if (user.mustChangePassword && element?.type?.name !== 'ChangePasswordPage') {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
}

// ── PublicOnlyRoute ────────────────────────────────────────────────────────
// If user is already logged in and visits /login or /signup,
// redirect them straight to their dashboard.
function PublicOnlyRoute({ element }) {
  const { user, token } = useAuthStore();

  if (token && user) {
    // Temp-password users must change their password first — don't let
    // them land on a dashboard if they revisit /login or /signup.
    if (user.mustChangePassword) {
      return <Navigate to="/change-password" replace />;
    }
    if (user.role === "ADMIN")  return <Navigate to="/admin/dashboard"  replace />;
    if (user.role === "MENTOR") return <Navigate to="/mentor/dashboard" replace />;
    if (user.role === "MENTEE") return <Navigate to="/mentee/dashboard" replace />;
  }

  return element;
}

// ── Unauthorized Page ──────────────────────────────────────────────────────
function UnauthorizedPage() {
  const { user } = useAuthStore();

  const dashboard =
    user?.role === "ADMIN"  ? "/admin/dashboard"  :
    user?.role === "MENTOR" ? "/mentor/dashboard" :
    user?.role === "MENTEE" ? "/mentee/dashboard" :
    "/login";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas font-sans p-6">
      <div className="card max-w-md w-full p-10 text-center shadow-sm">
        <span className="inline-flex w-12 h-12 mb-5 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
          <Lock size={22} />
        </span>
        <h1 className="font-display text-xl font-bold text-slate-900 m-0 mb-2">
          Access Denied
        </h1>
        <p className="text-slate-600 text-sm m-0 mb-7 leading-relaxed">
          You don't have permission to access this page.
          {user && (
            <> Your role is <strong className="font-semibold text-slate-900">{user.role}</strong>.</>
          )}
        </p>
        <a
          href={dashboard}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg
            bg-brand-600 text-white text-sm font-semibold no-underline shadow-xs
            transition-colors duration-150 hover:bg-brand-700"
        >
          Go to My Dashboard <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}

// ── Role → Page Access Map (from the guide) ────────────────────────────────
// ADMIN  → /admin/dashboard
// MENTOR → /mentor/dashboard
// MENTEE → /mentee/dashboard
// ALL    → /change-password

export default function App() {
  const token = useAuthStore((s) => s.token);

  // Reconnect the real-time socket on app load when a session is already persisted
  // (login/logout are handled inside the auth store). connectSocket() is idempotent.
  useEffect(() => {
    if (token) connectSocket();
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Public-only — logged in users are redirected to their dashboard */}
        <Route path="/login"  element={<PublicOnlyRoute element={<LoginPage />}  />} />
        <Route path="/signup" element={<PublicOnlyRoute element={<SignupPage />} />} />

        {/* Requires login — any role */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute
              element={<ChangePasswordPage />}
              allowedRoles={["ADMIN", "MENTOR", "MENTEE"]}
            />
          }
        />

        {/* Admin only */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              element={<AdminDashboard />}
              allowedRoles={["ADMIN"]}
            />
          }
        />

        {/* Mentor only */}
        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute
              element={<MentorDashboard />}
              allowedRoles={["MENTOR"]}
            />
          }
        />

        {/* Mentee only */}
        <Route
          path="/mentee/dashboard"
          element={
            <ProtectedRoute
              element={<MenteeDashboard />}
              allowedRoles={["MENTEE"]}
            />
          }
        />

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Legacy redirects — keep for backwards-compat during migration */}
        <Route path="/admin-dashboard"  element={<Navigate to="/admin/dashboard"  replace />} />
        <Route path="/mentor-dashboard" element={<Navigate to="/mentor/dashboard" replace />} />
        <Route path="/mentee-dashboard" element={<Navigate to="/mentee/dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}
