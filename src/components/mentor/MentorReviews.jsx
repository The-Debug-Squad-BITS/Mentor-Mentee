import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { toast } from "react-toastify";

export default function MentorReviews() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewTab, setReviewTab] = useState("Pending"); // "Pending" | "History"

  // Per-submission feedback text, keyed by submission _id
  const [feedbackMap, setFeedbackMap] = useState({});
  // Per-submission action loading state
  const [actionLoading, setActionLoading] = useState({});
  // Per-submission inline error
  const [actionError, setActionError] = useState({});

  // ── Load all submissions ──────────────────────────────────────────────
  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/submissions", { params: { limit: 50 } });
      setSubmissions(response.data.data.submissions || []);
    } catch (err) {
      setError("Failed to load submissions. Please try again.");
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // ── Approve submission ────────────────────────────────────────────────
  const handleApprove = async (submissionId) => {
    const feedback = (feedbackMap[submissionId] || "").trim();
    if (!feedback) {
      setActionError((prev) => ({
        ...prev,
        [submissionId]: "Feedback is required before approving.",
      }));
      return;
    }
    setActionError((prev) => ({ ...prev, [submissionId]: null }));
    setActionLoading((prev) => ({ ...prev, [submissionId]: "approve" }));

    try {
      await api.patch(`/submissions/${submissionId}/approve`, { feedback });
      toast.success("Submission approved! Mentee has been notified.");
      setFeedbackMap((prev) => ({ ...prev, [submissionId]: "" }));
      loadSubmissions();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to approve submission."
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [submissionId]: null }));
    }
  };

  // ── Request revision ──────────────────────────────────────────────────
  const handleRequestRevision = async (submissionId) => {
    const feedback = (feedbackMap[submissionId] || "").trim();
    if (!feedback) {
      setActionError((prev) => ({
        ...prev,
        [submissionId]: "Please provide feedback explaining what needs revision.",
      }));
      return;
    }
    setActionError((prev) => ({ ...prev, [submissionId]: null }));
    setActionLoading((prev) => ({ ...prev, [submissionId]: "revision" }));

    try {
      await api.patch(`/submissions/${submissionId}/revision`, { feedback });
      toast.success("Revision requested. Mentee has been notified.");
      setFeedbackMap((prev) => ({ ...prev, [submissionId]: "" }));
      loadSubmissions();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to request revision."
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [submissionId]: null }));
    }
  };

  // ── Split into tabs ───────────────────────────────────────────────────
  const pending = submissions.filter((s) => s.status === "PENDING_REVIEW");
  const history = submissions.filter(
    (s) => s.status === "APPROVED" || s.status === "REVISION_NEEDED"
  );

  const statusStyles = {
    PENDING_REVIEW:  "bg-amber-50 text-amber-600 border-amber-100",
    APPROVED:        "bg-emerald-50 text-emerald-600 border-emerald-100",
    REVISION_NEEDED: "bg-red-50 text-red-600 border-red-100",
  };

  const statusLabels = {
    PENDING_REVIEW:  "Pending Review",
    APPROVED:        "Approved",
    REVISION_NEEDED: "Revision Needed",
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pl-0 md:pl-4 lg:pl-8">

      {/* Header */}
      <div
        className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}
      >
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Reviews Center
          </h1>
          <p className="m-0 mt-1 text-slate-400 text-xs font-semibold">
            Inspect submitted student deliverable files and approve milestones or request revisions.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
          {["Pending", "History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setReviewTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                reviewTab === tab
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              {tab === "Pending"
                ? `Pending Queue (${pending.length})`
                : `Review History (${history.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content */}
      <div
        className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-5"
        style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.04)" }}
      >
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">
            Loading submissions...
          </div>
        ) : reviewTab === "Pending" ? (
          /* ── Pending Queue ── */
          pending.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">
              🎉 Excellent work! The review queue is empty.
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {pending.map((sub) => {
                const isActioning = !!actionLoading[sub._id];
                return (
                  <div
                    key={sub._id}
                    className="border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 bg-slate-50/20"
                  >
                    {/* Header row */}
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <span className="text-slate-800 text-xs md:text-sm font-black">
                          {sub.taskId?.title || "Task"}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                          Submitted by:{" "}
                          <span className="text-slate-600">
                            {sub.submittedBy?.name || "Unknown"}
                          </span>
                        </span>
                        <span className="block text-[10px] text-slate-400 font-bold">
                          {sub.submittedAt
                            ? new Date(sub.submittedAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wide ${
                          statusStyles[sub.status] || ""
                        }`}
                      >
                        {statusLabels[sub.status] || sub.status}
                      </span>
                    </div>

                    {/* Mentee notes */}
                    {sub.notes && (
                      <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 font-semibold leading-relaxed">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                          Student Notes:
                        </span>
                        "{sub.notes}"
                      </div>
                    )}

                    {/* Submission content — smart display per type */}
                    {sub.submissionType === "file" && sub.fileUrl && (
                      <div className="flex flex-col gap-2">
                        {/* Inline image preview */}
                        {sub.mimeType && sub.mimeType.startsWith("image/") && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                            <img
                              src={sub.fileUrl}
                              alt="Submitted work"
                              className="w-full max-h-56 object-contain"
                              style={{ display: "block" }}
                            />
                          </div>
                        )}
                        {/* PDF open link */}
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-xs hover:text-indigo-800 transition-colors w-fit"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          {sub.mimeType?.startsWith("image/") ? "Open Full Image ↗" : "Open PDF ↗"}
                        </a>
                      </div>
                    )}

                    {/* URL submission — clickable chip */}
                    {sub.submissionType === "url" && sub.submissionUrl && (
                      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        <span className="text-xs font-semibold text-indigo-700 flex-1 truncate max-w-xs">
                          {sub.submissionUrl}
                        </span>
                        <a
                          href={sub.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
                        >
                          Open ↗
                        </a>
                      </div>
                    )}

                    {/* Per-submission error */}
                    {actionError[sub._id] && (
                      <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold">
                        ⚠️ {actionError[sub._id]}
                      </div>
                    )}

                    {/* Feedback textarea + action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end mt-1 w-full">
                      <textarea
                        placeholder="Add feedback (required before approving or requesting revision)..."
                        value={feedbackMap[sub._id] || ""}
                        onChange={(e) =>
                          setFeedbackMap((prev) => ({
                            ...prev,
                            [sub._id]: e.target.value,
                          }))
                        }
                        className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none flex-1 font-sans bg-white resize-none w-full sm:w-auto focus:border-indigo-400 transition-colors"
                        style={{ minHeight: 60 }}
                        disabled={isActioning}
                      />
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleRequestRevision(sub._id)}
                          disabled={isActioning}
                          className="bg-transparent border border-red-200 hover:border-red-400 hover:bg-red-50 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 cursor-pointer transition-colors disabled:opacity-60"
                          style={{ fontFamily: "inherit" }}
                        >
                          {actionLoading[sub._id] === "revision"
                            ? "Sending..."
                            : "Request Changes"}
                        </button>
                        <button
                          onClick={() => handleApprove(sub._id)}
                          disabled={isActioning}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 border-0 rounded-xl text-xs cursor-pointer transition-colors shadow-md shadow-green-500/10 disabled:opacity-60"
                          style={{ fontFamily: "inherit" }}
                        >
                          {actionLoading[sub._id] === "approve"
                            ? "Approving..."
                            : "Approve Deliverable"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ── Review History tab ── */
          history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">
              No graded submission history found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50">
                    {["Task Title", "Mentee", "File", "Status", "Feedback Given", "Date"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 tracking-wide border-b border-slate-100"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((sub) => (
                    <tr
                      key={sub._id}
                      className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-black text-slate-800 text-xs md:text-sm">
                        {sub.taskId?.title || "Task"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-bold">
                        {sub.submittedBy?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        {sub.submissionType === "file" && sub.fileUrl ? (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 text-xs font-bold hover:text-indigo-800 transition-colors"
                          >
                            {sub.mimeType?.startsWith("image/") ? "🖼 View Image ↗" : "📄 View PDF ↗"}
                          </a>
                        ) : sub.submissionType === "url" && sub.submissionUrl ? (
                          <a
                            href={sub.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 text-xs font-bold hover:text-indigo-800 transition-colors"
                          >
                            🔗 Open Link ↗
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${
                            statusStyles[sub.status] || ""
                          }`}
                        >
                          {statusLabels[sub.status] || sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 italic max-w-xs truncate">
                        {sub.feedback ? `"${sub.feedback}"` : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-semibold">
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
