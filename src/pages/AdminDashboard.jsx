import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { SidebarToggle } from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import DashboardOverview from "../components/admin/DashboardOverview";
import ManageUsers from "../components/admin/ManageUsers";
import ProjectsList from "../components/admin/ProjectsList";
import ProjectDetail from "../components/admin/ProjectDetail";
import InvitationsList from "../components/admin/InvitationsList";
import ActivityLogs from "../components/admin/ActivityLogs";
import AdminSettings from "../components/admin/AdminSettings";
import PlaceholderSection from "../components/admin/PlaceholderSection";
import CreateUserModal from "../components/admin/CreateUserModal";
import TemplatesSection from "../components/admin/TemplatesSection";
import ChatSection from "../components/chat/ChatSection";

import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";

export default function AdminDashboard() {
  const [activeNav, setActiveNav]               = useState("Dashboard");
  const [projects, setProjects]                 = useState([]);
  const [logs, setLogs]                         = useState([]);
  const [showCreateUser, setShowCreateUser]     = useState(false);
  const [mobileOpen, setMobileOpen]             = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [statsError, setStatsError]             = useState(null);

  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const { adminStats, setAdminStats } = useDashboardStore();

  // ── Auth guard — redirect if not logged in or not admin ────────────
  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
    }
  }, [token, user, navigate]);

  // ── Fetch real admin stats from backend ────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/admin");
        setAdminStats(response.data.data);
        setStatsError(null);
      } catch (err) {
        if (err.response?.status === 403) {
          // Non-admin — interceptor handles 401, but 403 means wrong role
          navigate("/login");
        } else {
          setStatsError("Could not load dashboard stats from server.");
        }
      }
    };
    if (token) fetchStats();
  }, [token, setAdminStats, navigate]);

  // ── Local db refresh (stubbed out since mock DB is removed) ──────────
  const refreshData = () => {
    setProjects([]);
    setLogs([]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddProject = (name) => {
    // Stubbed until integrated with backend api
  };

  const handleUserCreated = () => {
    refreshData();
  };

  const handleActiveNavChange = (name) => {
    setActiveNav(name);
    setCurrentProjectId(null);
  };

  // ── Logout handler ─────────────────────────────────────────────────
  const handleLogout = () => {
    logout(); // Clears Zustand store + persisted localStorage
    navigate("/login");
  };

  const renderSection = () => {
    switch (activeNav) {
      case "Dashboard":
        return (
          <DashboardOverview
            projects={projects}
            logs={logs}
            onAddProject={handleAddProject}
            apiStats={adminStats}
          />
        );
      case "Projects":
        if (currentProjectId) {
          return (
            <ProjectDetail
              projectId={currentProjectId}
              onBack={() => setCurrentProjectId(null)}
              onRefresh={refreshData}
            />
          );
        }
        return (
          <ProjectsList
            onViewProject={(id) => setCurrentProjectId(id)}
            onRefresh={refreshData}
          />
        );
      case "Members":
        return (
          <ManageUsers
            key={Date.now()}
            onUserDeleted={handleUserCreated}
          />
        );
      case "Invitations":
        return <InvitationsList />;
      case "Activity":
        return <ActivityLogs />;
      case "Messages":
        return <ChatSection />;
      case "Templates":
        return <TemplatesSection />;
      case "Settings":
        return <AdminSettings />;
      default:
        return <PlaceholderSection title={activeNav} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden w-full">
      <AdminSidebar
        activeNav={activeNav}
        setActiveNav={handleActiveNavChange}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main
        className="flex-1 min-h-screen min-w-0
        ml-0 md:ml-55 lg:ml-65
        p-4 sm:p-6 lg:p-8
        pt-16 md:pt-8"
      >
        <SidebarToggle
          onClick={() => setMobileOpen(true)}
          mobileOpen={mobileOpen}
        />

        <AdminHeader
          onAddUser={() => setShowCreateUser(true)}
          userName={user?.name}
          onLogout={handleLogout}
        />

        {/* Stats error banner */}
        {statsError && (
          <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            ⚠️ {statsError} Showing local data instead.
          </div>
        )}

        <div className="mt-6 md:mt-4">
          {renderSection()}
        </div>
      </main>

      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
}
