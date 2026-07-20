import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MentorSidebar, {
  MentorSidebarToggle,
} from "../components/mentor/MentorSidebar";
import MentorHeader from "../components/mentor/MentorHeader";
import MentorOverview from "../components/mentor/MentorOverview";
import MentorProjects from "../components/mentor/MentorProjects";
import MentorTasks from "../components/mentor/MentorTasks";
import MentorTeam from "../components/mentor/MentorTeam";
import MentorReviews from "../components/mentor/MentorReviews";
import MentorActivity from "../components/mentor/MentorActivity";
import MentorProfile from "../components/mentor/MentorProfile";
import NewUserModal from "../components/mentor/NewUserModal";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";
import PlaceholderSection from "../components/admin/PlaceholderSection";
import TemplatesSection from "../components/admin/TemplatesSection";
import ChatSection from "../components/chat/ChatSection";
import MeetingsSection from "../components/meetings/MeetingsSection";
import CalendarSection from "../components/calendar/CalendarSection";
import api from "../lib/api";

export default function MentorDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const { mentorStats, setMentorStats } = useDashboardStore();

  // ── Auth guard — redirect if not logged in ──────────────────────────
  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
    }
  }, [token, user, navigate]);

  // ── Fetch mentor dashboard stats from backend ───────────────────────
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/mentor");
        const data = response.data.data;
        // data.assignedProjects → "My Projects" stat card
        // data.pendingReviews   → "Pending Reviews" stat card
        // data.assignedMentees  → "My Mentees" stat card
        setMentorStats(data);
        setStatsError(null);
      } catch (err) {
        if (err.response?.status === 403) {
          // Non-mentor user trying to access
          navigate("/login");
        } else {
          setStatsError("Could not load dashboard stats from server.");
        }
      }
    };
    if (token) fetchDashboard();
  }, [token, setMentorStats, navigate]);

  const handleActiveNavChange = (name) => {
    setActiveNav(name);
  };

  // ── Logout handler ──────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderSection = () => {
    switch (activeNav) {
      case "Dashboard":
        return <MentorOverview mentorStats={mentorStats} onNavigate={handleActiveNavChange} />;
      case "My Projects":
        return <MentorProjects />;
      case "Tasks":
        return <MentorTasks />;
      case "Team":
        return <MentorTeam />;
      case "Reviews":
        return <MentorReviews />;
      case "Activity":
        return <MentorActivity />;
      case "Messages":
        return <ChatSection />;
      case "Meetings":
        return <MeetingsSection />;
      case "Calendar":
        return <CalendarSection />;
      case "Templates":
        return <TemplatesSection />;
      case "Profile":
        return <MentorProfile />;
      default:
        return <PlaceholderSection title={activeNav} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden w-full">
      <MentorSidebar
        activeNav={activeNav}
        setActiveNav={handleActiveNavChange}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main
        className="flex-1 min-h-screen min-w-0
        ml-0 md:ml-55 lg:ml-64
        py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:pr-8 lg:pl-0
        pt-16 md:pt-8"
      >
        <MentorSidebarToggle
          onClick={() => setMobileOpen(true)}
          mobileOpen={mobileOpen}
        />

        <MentorHeader
          userName={user?.name}
          onNewUser={() => setShowNewUserModal(true)}
          onLogout={handleLogout}
        />

        {/* Stats error banner */}
        {statsError && (
          <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            ⚠️ {statsError}
          </div>
        )}

        <div className="mt-6 md:mt-4 animate-fade-in">
          {renderSection()}
        </div>
      </main>

      {showNewUserModal && (
        <NewUserModal onClose={() => setShowNewUserModal(false)} />
      )}
    </div>
  );
}
