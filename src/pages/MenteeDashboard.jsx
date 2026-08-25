import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import MenteeSidebar, {
  MenteeSidebarToggle,
} from "../components/mentee/MenteeSidebar";
import MenteeHeader from "../components/mentee/MenteeHeader";
import MenteeDashboardOverview from "../components/mentee/MenteeDashboardOverview";
import MenteeTasks from "../components/mentee/MenteeTasks";
import MenteeProjects from "../components/mentee/MenteeProjects";
import MenteeFeedback from "../components/mentee/MenteeFeedback";
import MenteeActivity from "../components/mentee/MenteeActivity";
import MenteeProfile from "../components/mentee/MenteeProfile";
import ChatSection from "../components/chat/ChatSection";
import MeetingsSection from "../components/meetings/MeetingsSection";
import CalendarSection from "../components/calendar/CalendarSection";
import { Layers } from "../components/ui/Icons";
import { useAuthStore } from "../store/authStore";

export default function MenteeDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [menteeTasks, setMenteeTasks] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();

  // ── Auth guard — redirect if not logged in ──────────────────────────
  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
    }
  }, [token, user, navigate]);

  // ── Logout handler ──────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const refreshMenteeData = async () => {
    try {
      const response = await api.get('/tasks', { params: { limit: 5 } });
      setMenteeTasks(response.data.data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch mentee tasks:", err);
    }
  };

  useEffect(() => {
    refreshMenteeData();
  }, [user?._id]);

  const handleActiveNavChange = (name) => {
    setActiveNav(name);
    refreshMenteeData();
  };

  const renderSection = () => {
    switch (activeNav) {
      case "Dashboard":
        return (
          <MenteeDashboardOverview
            tasks={menteeTasks}
            onNavigate={handleActiveNavChange}
            onTaskClick={() => handleActiveNavChange("My Tasks")}
          />
        );
      case "My Tasks":
        return <MenteeTasks />;
      case "My Projects":
        return <MenteeProjects />;
      case "Feedback":
        return <MenteeFeedback />;
      case "Activity":
        return <MenteeActivity />;
      case "Messages":
        return <ChatSection />;
      case "Meetings":
        return <MeetingsSection />;
      case "Calendar":
        return <CalendarSection />;
      case "Profile":
        return <MenteeProfile />;
      default:
        return (
          <div className="card">
            <div className="empty-state">
              <span className="empty-state-icon">
                <Layers size={22} />
              </span>
              <p className="empty-state-title">{activeNav}</p>
              <p className="empty-state-text">
                This section isn&apos;t available yet. Pick another item from the sidebar to
                carry on.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas font-sans overflow-x-hidden w-full">
      <MenteeSidebar
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
        <MenteeSidebarToggle
          onClick={() => setMobileOpen(true)}
          mobileOpen={mobileOpen}
        />

        <div className="mx-auto w-full max-w-[1600px]">
          <MenteeHeader
            activeNav={activeNav}
            onMessageMentor={() => handleActiveNavChange("Feedback")}
            userName={user?.name}
            onLogout={handleLogout}
          />

          <div className="mt-6 md:mt-4 animate-fade-in">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
}
