import { useState, useEffect } from "react";
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
import PlaceholderSection from "../components/admin/PlaceholderSection";

export default function MentorDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "2",
    name: "Sarah Connor",
    role: "MENTOR"
  };

  const refreshDashboardData = () => {
    setProjects([]);
  };

  useEffect(() => {
    refreshDashboardData();
  }, [currentUser.id]);

  const handleActiveNavChange = (name) => {
    setActiveNav(name);
    refreshDashboardData();
  };

  const renderSection = () => {
    switch (activeNav) {
      case "Dashboard":
        return <MentorOverview projects={projects} onNavigate={handleActiveNavChange} />;
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

        <MentorHeader onNewUser={() => setShowNewUserModal(true)} />
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
