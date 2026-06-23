import { useState, useEffect } from "react";
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
import { useAuthStore } from "../store/authStore";

export default function MenteeDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [menteeTasks, setMenteeTasks] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "1",
    name: "Emily Davies",
    role: "MENTEE"
  };

  const refreshMenteeData = () => {
    setMenteeTasks([]);
  };

  useEffect(() => {
    refreshMenteeData();
  }, [currentUser.id]);

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
      case "Profile":
        return <MenteeProfile />;
      default:
        return (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400">
            <h2 className="m-0 text-slate-700">{activeNav}</h2>
            <p className="m-0 text-xs">Section is loading...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden w-full">
      <MenteeSidebar
        activeNav={activeNav}
        setActiveNav={handleActiveNavChange}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main
        className="flex-1 min-h-screen min-w-0
        ml-0 md:ml-55 lg:ml-64
        p-4 sm:p-6 lg:p-8
        pt-16 md:pt-8"
      >
        <MenteeSidebarToggle
          onClick={() => setMobileOpen(true)}
          mobileOpen={mobileOpen}
        />

        <MenteeHeader
          activeNav={activeNav}
          onMessageMentor={() => handleActiveNavChange("Feedback")}
        />
        
        <div className="mt-6 md:mt-4">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
