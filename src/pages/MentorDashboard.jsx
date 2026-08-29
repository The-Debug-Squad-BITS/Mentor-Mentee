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
import { useAuthStore } from "../store/authStore";
import useSeo from "../hooks/useSeo";
import { pageMeta } from "../lib/pageMeta";
import { useDashboardStore } from "../store/dashboardStore";
import PlaceholderSection from "../components/admin/PlaceholderSection";
import TemplatesSection from "../components/admin/TemplatesSection";
import ChatSection from "../components/chat/ChatSection";
import MeetingsSection from "../components/meetings/MeetingsSection";
import CalendarSection from "../components/calendar/CalendarSection";
import { AlertTriangle } from "../components/ui/Icons";
import api from "../lib/api";

export default function MentorDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  // Behind a login, so never indexed; the title tracks the open section.
  useSeo({
    title: `${pageMeta("MENTOR", activeNav).title} — Trellis`,
    path: "/mentor/dashboard",
    noindex: true,
  });
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
    <div className="flex min-h-screen bg-canvas font-sans overflow-x-hidden w-full">
      <MentorSidebar
        activeNav={activeNav}
        setActiveNav={handleActiveNavChange}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main
        className="flex-1 min-h-screen min-w-0
        ml-0 md:ml-56 lg:ml-64
        p-4 sm:p-6 lg:p-8
        pt-16 md:pt-8"
      >
        <MentorSidebarToggle
          onClick={() => setMobileOpen(true)}
          mobileOpen={mobileOpen}
        />

        <div className="mx-auto w-full max-w-[1600px]">
          <MentorHeader
            activeNav={activeNav}
            userName={user?.name}
            onLogout={handleLogout}
          />

          {/* Stats error banner */}
          {statsError && (
            <div className="notice notice-warning mb-4">
              <AlertTriangle size={16} className="mt-px shrink-0" />
              <span>{statsError}</span>
            </div>
          )}

          <div className="mt-6 md:mt-4 animate-fade-in">
            {renderSection()}
          </div>
        </div>
      </main>

    </div>
  );
}
