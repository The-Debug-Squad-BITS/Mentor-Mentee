import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans p-6">
      <div
        className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-slate-100"
        style={{ boxShadow: "0 8px 40px rgba(99,102,241,0.1)" }}
      >
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-xl font-black text-slate-800 m-0 mb-2">
          Access Denied
        </h1>
        <p className="text-slate-500 text-sm m-0 mb-6 leading-relaxed">
          You don't have permission to access this page.
          {user && (
            <> Your role is <strong className="text-slate-700">{user.role}</strong>.</>
          )}
        </p>
        <a
          href={dashboard}
          className="inline-block px-6 py-3 rounded-xl text-white text-sm font-bold no-underline"
          style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}
        >
          Go to My Dashboard
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
