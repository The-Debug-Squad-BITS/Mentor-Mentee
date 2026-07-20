export default function MenteeActivity() {
  // Note: the backend does not expose a mentee-accessible activity-log endpoint.
  // (GET /api/activities is ADMIN-only and /activities/project/:id is ADMIN/MENTOR.)
  // Rather than show a fake or permanently-empty timeline, this page honestly
  // points mentees to the sections where their activity IS surfaced today.
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Track Activities</h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">Timeline of your task submissions, review notifications, and progress milestones.</p>
      </div>

      {/* Honest empty / info state */}
      <div className="bg-white rounded-xl p-8 md:p-12 border border-slate-200 shadow-sm">
        <div className="max-w-md mx-auto text-center flex flex-col items-center gap-4">
          <div className="text-4xl">🧭</div>
          <h2 className="m-0 text-base font-bold text-slate-900">Your activity lives across your dashboard</h2>
          <p className="m-0 text-slate-500 text-sm leading-relaxed">
            A dedicated personal activity feed isn't available yet. In the meantime, you can track everything
            you're working on from these sections:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-2">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col items-center gap-1">
              <span className="text-xl">✅</span>
              <span className="text-sm font-semibold text-slate-800">My Tasks</span>
              <span className="text-[11px] text-slate-500">assignments & status</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col items-center gap-1">
              <span className="text-xl">💬</span>
              <span className="text-sm font-semibold text-slate-800">Feedback</span>
              <span className="text-[11px] text-slate-500">advisor reviews</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col items-center gap-1">
              <span className="text-xl">🏁</span>
              <span className="text-sm font-semibold text-slate-800">Dashboard</span>
              <span className="text-[11px] text-slate-500">upcoming milestones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
