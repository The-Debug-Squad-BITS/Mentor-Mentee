import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginLeftPanel from "../components/login/LoginLeftPanel";
import LoginRightPanel from "../components/login/LoginRightPanel";
import ResetPasswordModal from "../components/login/ResetPasswordModal";

import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function LoginPage({ onNavigate, onBack }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

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

      // First-time login: must change temporary password
      if (user.mustChangePassword) {
        navigate("/change-password");
        return;
      }
      // Role-based redirect
      if (user.role === "ADMIN")  navigate("/admin/dashboard");
      if (user.role === "MENTOR") navigate("/mentor/dashboard");
      if (user.role === "MENTEE") navigate("/mentee/dashboard");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(email, password);
  };

  const handleGoogleLogin = () =>
    setError("Google login is not available. Please use your email and password.");

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] bg-white text-slate-900 overflow-x-hidden">
      <LoginLeftPanel onNavigate={onNavigate} onBack={onBack} />
      <LoginRightPanel
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        onNavigate={onNavigate}
        onBack={onBack}
        onForgotPassword={() => setShowResetModal(true)}
      />
      {showResetModal && (
        <ResetPasswordModal
          initialEmail={email}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
}
