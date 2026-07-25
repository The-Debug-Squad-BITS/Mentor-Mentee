import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function MenteeActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get("/activities/me", { params: { limit: 20 } });
        setActivities(response.data.data.activities || []);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Track Activities</h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">Timeline of your task submissions, review notifications, and progress milestones.</p>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading activity feed...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">
            No activities logged yet. Get started by completing your assigned tasks!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activities.map((act) => (
              <div key={act._id} className="flex gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {act.action === "CREATED" ? "✨" : act.action === "UPDATED" ? "🔄" : act.action === "COMPLETED" ? "✅" : "📌"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm text-slate-900 leading-snug">
                    <span className="font-semibold">{act.userId?.name || "You"}</span>{" "}
                    {act.action.toLowerCase()}{" "}
                    {act.entityType.toLowerCase()}{" "}
                    {act.metadata?.title && <span className="font-medium text-slate-700">"{act.metadata.title}"</span>}
                  </p>
                  <p className="m-0 mt-1 text-xs text-slate-500 font-medium">
                    {new Date(act.createdAt).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
