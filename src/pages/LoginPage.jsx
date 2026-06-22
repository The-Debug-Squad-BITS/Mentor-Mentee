import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { demoAccounts } from "../data/demoAccounts";
import LoginLeftPanel from "../components/login/LoginLeftPanel";
import LoginRightPanel from "../components/login/LoginRightPanel";
import LoginSuccessScreen from "../components/login/LoginSuccessScreen";

import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function LoginPage({ onNavigate, onBack }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [demoSuccess, setDemoSuccess]   = useState(null); // "admin" | "mentor" | "student" | null
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  // ── Shared login logic (used by form submit AND demo buttons) ──────────
  const doLogin = async (emailVal, passwordVal) => {
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: emailVal,
        password: passwordVal,
      });

      const { token, user } = response.data.data;

      // Persist to Zustand store + localStorage (via persist middleware)
      login(user, token);

      // Show brief success animation before redirect
      setDemoSuccess(
        user.role === "ADMIN"   ? "admin"
        : user.role === "MENTOR" ? "mentor"
        : "student"
      );
      setLoggedInUser(user);

      setTimeout(() => {
        // First-time login: must change temporary password
        if (user.mustChangePassword) {
          navigate("/change-password");
          return;
        }
        // Role-based redirect
        if (user.role === "ADMIN")  navigate("/admin/dashboard");
        if (user.role === "MENTOR") navigate("/mentor/dashboard");
        if (user.role === "MENTEE") navigate("/mentee/dashboard");
      }, 300);

    } catch (err) {
      const status = err.response?.status;
      const data   = err.response?.data;

      if (status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (status === 400 && data?.errors?.length) {
        // Field-level validation errors — show all messages
        setError(data.errors.map((e) => e.message).join(" "));
      } else if (data?.message) {
        setError(data.message);
      } else if (!err.response) {
        setError(
          "Cannot connect to the server. Make sure the backend is running on port 5000."
        );
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Form submit ────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(email, password);
  };

  // ── Demo button: fill fields + call real API with demo credentials ─────
  const loginOfflineDemo = (demoAccount) => {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    doLogin(demoAccount.email, demoAccount.password);
  };

  const handleGoogleLogin = () =>
    setError("Google login is not available. Please use your email and password.");

  // ── Sign out from success screen ───────────────────────────────────────
  const handleSignOut = () => {
    setLoggedInUser(null);
    setDemoSuccess(null);
    setEmail("");
    setPassword("");
  };

  // ── Render success screen briefly before navigating away ──────────────
  if (loggedInUser && demoSuccess) {
    return (
      <LoginSuccessScreen
        user={loggedInUser}
        onSignOut={handleSignOut}
        onNavigate={onNavigate}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] bg-[#F7F4EF] font-['DM_Sans',sans-serif] text-[#1A1714] overflow-x-hidden">
      <LoginLeftPanel onNavigate={onNavigate} onBack={onBack} />
      <LoginRightPanel
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={loading}
        error={error}
        demoSuccess={demoSuccess}
        onSubmit={handleSubmit}
        onDemoLogin={loginOfflineDemo}
        onGoogleLogin={handleGoogleLogin}
        onNavigate={onNavigate}
        onBack={onBack}
      />
    </div>
  );
}
