import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { connectSocket } from "./lib/socket";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Lock, ArrowRight } from "./components/ui/Icons";
import Brand from "./components/ui/Brand";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import RouteLoader from "./components/ui/RouteLoader";

// Pages — code-split per route. Each dashboard pulls in a large, role-specific
// subtree that the other two roles never render, and a visitor on the landing
// page needs none of them. Splitting here is what keeps the first load small.
const LandingPage        = lazy(() => import("./pages/LandingPage"));
const LoginPage          = lazy(() => import("./pages/LoginPage"));
const SignupPage         = lazy(() => import("./pages/SignupPage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));
const AdminDashboard     = lazy(() => import("./pages/AdminDashboard"));
const MentorDashboard    = lazy(() => import("./pages/MentorDashboard"));
const MenteeDashboard    = lazy(() => import("./pages/MenteeDashboard"));

// ── ProtectedRoute ─────────────────────────────────────────────────────────
// Redirects to /login if not authenticated.
// Redirects to /unauthorized if role is not in allowedRoles.
function ProtectedRoute({ element, allowedRoles, allowTempPassword = false }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Force temp-password users to /change-password before accessing any dashboard.
  // The change-password route opts out via allowTempPassword: routes are lazy(),
  // so their element has no stable .type.name to identify them by any more.
  if (user.mustChangePassword && !allowTempPassword) {
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
      <Brand size="lg" className="mb-6" />
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
      <ErrorBoundary>
        <Suspense fallback={<RouteLoader />}>
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
              allowTempPassword
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
        </Suspense>
      </ErrorBoundary>
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
