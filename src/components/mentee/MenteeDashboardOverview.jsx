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
    <div className="flex flex-col gap-5 animate-fade-in">
      <MenteeQuickStats />

      {/* Work on the left, context on the right. An explicit grid keeps the
          two columns proportional instead of relying on flex-basis guesses. */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        {/* Left column */}
        <div className="flex w-full min-w-0 flex-col gap-5">
          <AssignedProjectsCard
            onViewAll={() => onNavigate("My Projects")}
          />
          <MyTasksCard
            tasks={tasks}
            onManageTasks={() => onNavigate("My Tasks")}
            onTaskClick={onTaskClick}
          />
          <NotificationsCard />
        </div>

        {/* Right column */}
        <div className="flex w-full min-w-0 flex-col gap-5">
          <UpcomingMeetingsCard onNavigate={onNavigate} />
          <UpcomingDeadlinesCard onNavigate={onNavigate} />
          <UpcomingMilestonesCard />
          <RecentFeedbackCard />
        </div>
      </div>
    </div>
  );
}
