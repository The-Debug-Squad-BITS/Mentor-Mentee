import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LandingPage        from "./pages/LandingPage";
import LoginPage          from "./pages/LoginPage";
import SignupPage         from "./pages/SignupPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminDashboard     from "./pages/AdminDashboard";
import MentorDashboard    from "./pages/MentorDashboard";
import MenteeDashboard    from "./pages/MenteeDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Mentor routes */}
        <Route path="/mentor/dashboard" element={<MentorDashboard />} />

        {/* Mentee routes */}
        <Route path="/mentee/dashboard" element={<MenteeDashboard />} />

        {/* Legacy routes — keep for backwards-compat during migration */}
        <Route path="/admin-dashboard"  element={<Navigate to="/admin/dashboard"  replace />} />
        <Route path="/mentor-dashboard" element={<Navigate to="/mentor/dashboard" replace />} />
        <Route path="/mentee-dashboard" element={<Navigate to="/mentee/dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
