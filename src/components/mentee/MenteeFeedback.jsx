import { useState, useEffect } from "react";
import { Refresh, CheckCircle, Inbox } from "../ui/Icons";
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
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title m-0">Feedback</h1>
        <p className="page-subtitle mt-1">
          Advisor review decisions, approvals, and the changes they have asked for.
        </p>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revision Requests — actionable, so it leads */}
        <div className="card flex flex-col">
          <div className="card-header">
            <div>
              <h2 className="section-title m-0 flex items-center gap-2">
                <Refresh size={16} className="text-warning-600" />
                Revision Requests
                <span className="badge badge-warning">{rejectedNotes.length}</span>
              </h2>
              <p className="m-0 mt-0.5 text-[12.5px] text-slate-500">
                Work your advisor has asked you to update.
              </p>
            </div>
          </div>

          <div className="flex max-h-64 flex-col gap-3 overflow-y-auto p-5 scrollbar-slim">
            {rejectedNotes.length === 0 ? (
              <div className="empty-state py-8">
                <p className="empty-state-title">Nothing to revise</p>
                <p className="empty-state-text">
                  You have no open revision requests right now.
                </p>
              </div>
            ) : (
              rejectedNotes.map(f => (
                <div
                  key={f.id}
                  className="flex flex-col gap-2 rounded-xl border border-warning-200 bg-warning-50/50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-semibold text-slate-900">{f.taskTitle}</span>
                    <span className="badge badge-warning shrink-0">Changes Needed</span>
                  </div>
                  <p className="m-0 text-[13px] leading-relaxed text-slate-700">
                    &ldquo;{f.comment}&rdquo;
                  </p>
                  <span className="self-end text-[11.5px] font-medium text-slate-500">
                    {f.createdAt}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Approved */}
        <div className="card flex flex-col">
          <div className="card-header">
            <div>
              <h2 className="section-title m-0 flex items-center gap-2">
                <CheckCircle size={16} className="text-success-600" />
                Approved Milestones
                <span className="badge badge-success">{approvedNotes.length}</span>
              </h2>
              <p className="m-0 mt-0.5 text-[12.5px] text-slate-500">
                Work your advisor has signed off.
              </p>
            </div>
          </div>

          <div className="flex max-h-64 flex-col gap-3 overflow-y-auto p-5 scrollbar-slim">
            {approvedNotes.length === 0 ? (
              <div className="empty-state py-8">
                <p className="empty-state-title">No approvals yet</p>
                <p className="empty-state-text">
                  Approved submissions will be listed here as your advisor reviews them.
                </p>
              </div>
            ) : (
              approvedNotes.map(f => (
                <div
                  key={f.id}
                  className="flex flex-col gap-2 rounded-xl border border-success-200 bg-success-50/50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-semibold text-slate-900">{f.taskTitle}</span>
                    <span className="badge badge-success shrink-0">Approved</span>
                  </div>
                  <p className="m-0 text-[13px] leading-relaxed text-slate-700">
                    &ldquo;{f.comment}&rdquo;
                  </p>
                  <span className="self-end text-[11.5px] font-medium text-slate-500">
                    {f.createdAt}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="section-title m-0">
            Feedback History{" "}
            <span className="badge badge-neutral ml-1">{feedbacks.length}</span>
          </h2>
        </div>

        {feedbacks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Inbox size={22} />
            </span>
            <p className="empty-state-title">No feedback recorded yet</p>
            <p className="empty-state-text">
              Every review decision your advisor makes will be logged here with its date and
              notes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[700px]">
              <thead>
                <tr>
                  {["Task Title", "Project Track", "Reviewer", "Date", "Notes"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feedbacks.map(f => (
                  <tr key={f.id}>
                    <td className="font-semibold text-slate-900">{f.taskTitle}</td>
                    <td>{f.projectName}</td>
                    <td>Sarah Connor</td>
                    <td className="whitespace-nowrap text-slate-500">{f.createdAt}</td>
                    <td className="max-w-xs truncate italic text-slate-600">
                      &ldquo;{f.comment}&rdquo;
                    </td>
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
