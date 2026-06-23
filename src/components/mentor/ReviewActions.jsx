import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

export default function ReviewActions() {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState("");

  const { user } = useAuthStore();
  const currentUser = user || { id: "2" };

  const refreshList = () => {
    // Stubbed until integrated with backend API
    setPendingTasks([]);
    setSelectedTask(null);
    setComment("");
  };

  useEffect(() => {
    refreshList();
  }, [currentUser.id]);

  const handleReview = (actionType) => {
    if (!selectedTask) return;
    if (!comment.trim()) {
      alert("Please provide a comment for the feedback.");
      return;
    }

    // Stubbed until integrated with backend API
    alert(`Task status updated: ${actionType === "approve" ? "Approved" : "Revision Requested"}`);
    refreshList();
  };

  return (
    <div
      className="ml-0 md:ml-4 lg:ml-8 bg-white rounded-2xl p-4 md:p-6 lg:p-8 border border-slate-100 mb-5 md:mb-6 lg:mb-8"
      style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.07)" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-base md:text-lg lg:text-xl font-black text-slate-800">
          Pending Submissions Review
        </h2>
        {selectedTask && (
          <button
            onClick={() => { setSelectedTask(null); setComment(""); }}
            className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            style={{ fontFamily: "inherit" }}
          >
            ← Back to List
          </button>
        )}
      </div>

      {!selectedTask ? (
        // LIST OF PENDING SUBMISSIONS
        pendingTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-3">✓</div>
            <p className="m-0 text-sm font-semibold">All submissions reviewed! Excellent work.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingTasks.map((t) => {
              const latestSub = t.submissions && t.submissions.length > 0
                ? t.submissions[t.submissions.length - 1]
                : null;
              
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="p-4 bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-xl cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                >
                  <div>
                    <span className="bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-md text-[10px] uppercase">
                      {t.projectName}
                    </span>
                    <h3 className="m-0 mt-2 text-sm font-extrabold text-slate-800">{t.title}</h3>
                    <p className="m-0 mt-1 text-xs text-slate-500 font-semibold">
                      Submitted by: <span className="text-slate-800">{t.assigneeName}</span>
                    </p>
                  </div>
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 border-0 rounded-lg text-xs cursor-pointer transition-all"
                    style={{ fontFamily: "inherit" }}
                  >
                    Review Deliverables
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // DETAILS & REVIEW ACTION FORM
        <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50">
          <div className="mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Project Name</span>
            <span className="font-extrabold text-slate-800 text-sm">{selectedTask.projectName}</span>
          </div>

          <div className="mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Task Title</span>
            <span className="font-extrabold text-slate-800 text-sm">{selectedTask.title}</span>
          </div>

          <div className="mb-6 bg-white p-4 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Mentee Submission Content</span>
            <p className="m-0 text-slate-700 text-xs md:text-sm font-medium leading-relaxed italic">
              "{selectedTask.submissions && selectedTask.submissions.length > 0 
                ? selectedTask.submissions[selectedTask.submissions.length - 1].content 
                : "No submission notes provided."}"
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 mb-2">Review Feedback Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide specific constructive feedback or approval notes here..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs md:text-sm outline-none resize-none focus:border-indigo-400 bg-white"
              style={{ minHeight: 90, fontFamily: "inherit" }}
            />
          </div>

          <div className="flex gap-4">
            {/* Request revisions */}
            <button
              onClick={() => handleReview("reject")}
              className="flex-1 py-3 border border-amber-200 bg-amber-50 hover:bg-amber-100 font-bold text-xs md:text-sm text-amber-700 rounded-xl cursor-pointer transition-colors"
              style={{ fontFamily: "inherit" }}
            >
              Request Revisions
            </button>

            {/* Approve */}
            <button
              onClick={() => handleReview("approve")}
              className="flex-1 py-3 border-0 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs md:text-sm text-white rounded-xl cursor-pointer transition-colors"
              style={{
                boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                fontFamily: "inherit"
              }}
            >
              Approve Submission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
