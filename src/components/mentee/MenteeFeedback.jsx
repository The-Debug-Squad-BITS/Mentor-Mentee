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
      <div className="bg-white rounded-3xl p-6 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">Academic Feedback Center</h1>
        <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">Review advisor grading reports, positive remarks, and constructive revision summaries.</p>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revision Requests */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
          <div>
            <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
              Revision Requests ({rejectedNotes.length})
            </h2>
            <p className="m-0 mt-0.5 text-slate-400 text-[11px] font-semibold">Milestones needing updates based on advisor feedback.</p>
          </div>
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {rejectedNotes.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-2xl border border-slate-100">No revisions currently requested.</div>
            ) : (
              rejectedNotes.map(f => (
                <div key={f.id} className="p-3 bg-red-50/30 border border-red-100 rounded-2xl flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800">{f.taskTitle}</span>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase">Changes Needed</span>
                  </div>
                  <p className="m-0 text-xs text-slate-600 font-semibold leading-relaxed">"{f.comment}"</p>
                  <span className="text-[9px] text-slate-400 font-bold uppercase self-end">{f.createdAt}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Positive remarks */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-4" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
          <div>
            <h2 className="m-0 text-sm md:text-base font-black text-slate-800">
              Approved Milestones ({approvedNotes.length})
            </h2>
            <p className="m-0 mt-0.5 text-slate-400 text-[11px] font-semibold">Outstanding milestones cleared by Lead Advisor.</p>
          </div>
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {approvedNotes.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-2xl border border-slate-100">No completed feedback recorded yet.</div>
            ) : (
              approvedNotes.map(f => (
                <div key={f.id} className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-2xl flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800">{f.taskTitle}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Approved</span>
                  </div>
                  <p className="m-0 text-xs text-slate-600 font-semibold leading-relaxed">"{f.comment}"</p>
                  <span className="text-[9px] text-slate-400 font-bold uppercase self-end">{f.createdAt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}>
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/20">
          <h2 className="m-0 text-sm md:text-base font-extrabold text-slate-800">Feedback History Log ({feedbacks.length})</h2>
        </div>
        {feedbacks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">No feedback records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-130">
              <thead>
                <tr className="bg-slate-50">
                  {["Task Title", "Project Track", "Reviewer", "Date", "Notes"].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feedbacks.map(f => (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-800 text-xs md:text-sm">{f.taskTitle}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-bold">{f.projectName}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-bold">Sarah Connor</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{f.createdAt}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-semibold italic truncate max-w-xs">"{f.comment}"</td>
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
