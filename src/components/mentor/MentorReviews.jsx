import { useState, useEffect } from "react";
import StatusBadge from "../ui/StatusBadge";
import { useAuthStore } from "../../store/authStore";

export default function MentorReviews() {
  const [reviews, setReviews] = useState([]);
  const [history, setHistory] = useState([]);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [reviewTab, setReviewTab] = useState("Pending"); // Pending | History

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "2",
    name: "Sarah Connor",
    role: "MENTOR"
  };

  const refreshReviews = () => {
    // Stubbed until integrated with backend API
    setReviews([]);
    setHistory([]);
  };

  useEffect(() => {
    refreshReviews();
  }, [currentUser.id]);

  const handleReviewAction = (taskId, action) => {
    // Stubbed until integrated with backend API
    setFeedbackNotes("");
    refreshReviews();
  };

  const statusStyles = {
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">Reviews Center</h1>
          <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Inspect submitted student deliverable files and approve milestones or request revisions.</p>
        </div>
        
        {/* Inner subtabs */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
          {["Pending", "History"].map(tab => (
            <button
              key={tab}
              onClick={() => setReviewTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                reviewTab === tab ? "bg-white text-indigo-600 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              {tab === "Pending" ? `Pending Queue (${reviews.length})` : "Review History"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reviews Queue */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-5" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        {reviewTab === "Pending" ? (
          reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">Excellent work! The grading queue is empty.</div>
          ) : (
            <div className="flex flex-col gap-5">
              {reviews.map(t => {
                const sub = t.submissions && t.submissions.find(s => s.status === "PENDING") || t.submissions && t.submissions[t.submissions.length - 1];
                return (
                  <div key={t.id} className="border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 bg-slate-50/20">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <span className="text-slate-800 text-xs md:text-sm font-black">{t.title}</span>
                        <span className="block text-[10px] text-slate-400 font-bold mt-0.5">Project: {t.projectName} | Submitted by: {t.assigneeName}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-500 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 uppercase">Under Review</span>
                    </div>

                    {sub && (
                      <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 font-semibold leading-relaxed">
                        "{sub.content}"
                      </div>
                    )}

                    <div className="flex gap-2 items-center mt-3 w-full">
                      <input
                        placeholder="Add revision feedback comments..."
                        value={feedbackNotes}
                        onChange={(e) => setFeedbackNotes(e.target.value)}
                        className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none flex-1 font-sans bg-white"
                      />
                      <button
                        onClick={() => handleReviewAction(t.id, "reject")}
                        className="bg-transparent border border-red-200 hover:border-red-400 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 cursor-pointer transition-colors"
                        style={{ fontFamily: "inherit" }}
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleReviewAction(t.id, "approve")}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 border-0 rounded-xl text-xs cursor-pointer transition-colors shadow-md shadow-green-500/10"
                        style={{ fontFamily: "inherit" }}
                      >
                        Approve Deliverable
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">No graded submission history found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    {["Task Title", "Mentee", "Project Track", "Graded Status", "Feedback Review"].map(h => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map(t => {
                    const activeFeedback = t.feedbacks && t.feedbacks[t.feedbacks.length - 1];
                    return (
                      <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-800 text-xs md:text-sm">{t.title}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-bold">{t.assigneeName}</td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-bold">{t.projectName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${statusStyles[t.status]}`}>
                            {t.status === "APPROVED" ? "Completed" : "Revision Needed"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 italic max-w-xs truncate">
                          {activeFeedback ? `"${activeFeedback.comment}"` : "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
