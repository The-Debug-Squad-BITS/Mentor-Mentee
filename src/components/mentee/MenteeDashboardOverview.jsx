import MenteeQuickStats from "./MenteeQuickStats";
import AssignedProjectsCard from "./AssignedProjectsCard";
import MyTasksCard from "./MyTasksCard";
import {
  RecentFeedbackCard,
  NotificationsCard,
  UpcomingMilestonesCard,
  UpcomingMeetingsCard,
  UpcomingDeadlinesCard
} from "./MenteeSideCards";

export default function MenteeDashboardOverview({
  tasks,
  onNavigate,
  onTaskClick,
}) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <MenteeQuickStats />

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-5 w-full lg:flex-2">
          <AssignedProjectsCard
            onViewAll={() => onNavigate("My Projects")}
          />
          <MyTasksCard
            tasks={tasks}
            onManageTasks={() => onNavigate("My Tasks")}
            onTaskClick={onTaskClick}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 w-full lg:flex-1 shrink-0">
          <UpcomingMeetingsCard onNavigate={onNavigate} />
          <UpcomingDeadlinesCard onNavigate={onNavigate} />
          <UpcomingMilestonesCard />
          <RecentFeedbackCard />
          <NotificationsCard />
        </div>
      </div>
    </div>
  );
}
