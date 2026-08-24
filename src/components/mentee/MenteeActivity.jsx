import { Compass, CheckCircle, MessageSquare, Flag } from "../ui/Icons";

export default function MenteeActivity() {
  // Note: the backend does not expose a mentee-accessible activity-log endpoint.
  // (GET /api/activities is ADMIN-only and /activities/project/:id is ADMIN/MENTOR.)
  // Rather than show a fake or permanently-empty timeline, this page honestly
  // points mentees to the sections where their activity IS surfaced today.
  const destinations = [
    { icon: CheckCircle, title: "My Tasks", desc: "Assignments & status" },
    { icon: MessageSquare, title: "Feedback", desc: "Mentor reviews" },
    { icon: Flag, title: "Dashboard", desc: "Upcoming milestones" },
  ];

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title m-0">Track Activities</h1>
        <p className="page-subtitle mt-1">
          Timeline of your task submissions, review notifications, and progress milestones.
        </p>
      </div>

      {/* Honest empty / info state */}
      <div className="card">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-12 text-center">
          <span className="empty-state-icon">
            <Compass size={22} />
          </span>
          <h2 className="empty-state-title m-0">Your activity lives across your dashboard</h2>
          <p className="empty-state-text m-0">
            A dedicated personal activity feed isn&apos;t available yet. In the meantime, you can
            track everything you&apos;re working on from these sections:
          </p>

          <div className="mt-3 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            {destinations.map((d) => {
              const Glyph = d.icon;
              return (
                <div
                  key={d.title}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600">
                    <Glyph size={16} />
                  </span>
                  <span className="text-[13px] font-semibold text-slate-800">{d.title}</span>
                  <span className="text-[11.5px] text-slate-500">{d.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
