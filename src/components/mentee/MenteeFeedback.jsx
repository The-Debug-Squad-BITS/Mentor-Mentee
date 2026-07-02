import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

export default function MenteeFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [approvedNotes, setApprovedNotes] = useState([]);
  const [rejectedNotes, setRejectedNotes] = useState([]);

  const { user } = useAuthStore();
  const currentUser = user || {
    id: "1",
    name: "Emily Davies",
    role: "MENTEE"
  };

  useEffect(() => {
    // Stubbed until integrated with backend API
    setFeedbacks([]);
    setApprovedNotes([]);
    setRejectedNotes([]);
  }, [currentUser.id]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Academic Feedback Center</h1>
        <p className="m-0 mt-1 text-slate-500 text-sm">Review advisor grading reports, positive remarks, and constructive revision summaries.</p>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revision Requests */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-5 shadow-sm">
          <div>
            <h2 className="m-0 text-sm md:text-base font-bold text-slate-900">
              Revision Requests ({rejectedNotes.length})
            </h2>
            <p className="m-0 mt-0.5 text-slate-500 text-xs">Milestones needing updates based on advisor feedback.</p>
          </div>
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {rejectedNotes.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">No revisions currently requested.</div>
            ) : (
              rejectedNotes.map(f => (
                <div key={f.id} className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{f.taskTitle}</span>
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md uppercase">Changes Needed</span>
                  </div>
                  <p className="m-0 text-xs text-slate-700 leading-relaxed">"{f.comment}"</p>
                  <span className="text-[10px] text-slate-500 font-medium uppercase self-end">{f.createdAt}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Positive remarks */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-5 shadow-sm">
          <div>
            <h2 className="m-0 text-sm md:text-base font-bold text-slate-900">
              Approved Milestones ({approvedNotes.length})
            </h2>
            <p className="m-0 mt-0.5 text-slate-500 text-xs">Outstanding milestones cleared by Lead Advisor.</p>
          </div>
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {approvedNotes.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">No completed feedback recorded yet.</div>
            ) : (
              approvedNotes.map(f => (
                <div key={f.id} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{f.taskTitle}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">Approved</span>
                  </div>
                  <p className="m-0 text-xs text-slate-700 leading-relaxed">"{f.comment}"</p>
                  <span className="text-[10px] text-slate-500 font-medium uppercase self-end">{f.createdAt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 bg-white">
          <h2 className="m-0 text-sm md:text-base font-bold text-slate-900">Feedback History Log ({feedbacks.length})</h2>
        </div>
        {feedbacks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No feedback records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50">
                  {["Task Title", "Project Track", "Reviewer", "Date", "Notes"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbacks.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{f.taskTitle}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{f.projectName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Sarah Connor</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{f.createdAt}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 italic truncate max-w-xs">"{f.comment}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
