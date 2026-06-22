import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginLeftPanel from "../components/login/LoginLeftPanel";
import SignupRightPanel from "../components/login/SignupRightPanel";

import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function SignupPage({ onNavigate, onBack }) {
  const [organizationName, setOrganizationName] = useState("");
  const [adminName, setAdminName]               = useState("");
  const [email, setEmail]                       = useState("");
  const [password, setPassword]                 = useState("");
  const [error, setError]                       = useState("");
  const [fieldErrors, setFieldErrors]           = useState({});
  const [loading, setLoading]                   = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await api.post("/auth/register-admin", {
        organizationName,
        adminName,
        email,
        password,
      });

      const { token, user } = response.data.data;

      // Persist token + user to Zustand store (auto-saved to localStorage)
      login(user, token);

      // Admin is always redirected to admin dashboard after registration
      navigate("/admin/dashboard");

    } catch (err) {
      const status = err.response?.status;
      const data   = err.response?.data;

      if (status === 409) {
        // Email already registered
        setError("This email is already registered. Please login instead.");
      } else if (status === 400 && data?.errors?.length) {
        // Field-level validation errors — map to fieldErrors object
        const mapped = {};
        data.errors.forEach(({ field, message }) => {
          mapped[field] = message;
        });
        setFieldErrors(mapped);
        setError("Please fix the errors above.");
      } else if (data?.message) {
        setError(data.message);
      } else if (!err.response) {
        setError("Cannot connect to server. Make sure the backend is running on port 5000.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] bg-[#F7F4EF] font-['DM_Sans',sans-serif] text-[#1A1714] overflow-x-hidden">
      {/* Reuse the exact same left panel as login */}
      <LoginLeftPanel onNavigate={onNavigate} onBack={onBack} />

      <SignupRightPanel
        organizationName={organizationName}
        setOrganizationName={setOrganizationName}
        adminName={adminName}
        setAdminName={setAdminName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fieldErrors={fieldErrors}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onNavigate={onNavigate}
        onBack={onBack}
      />
    </div>
  );
}
