import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import CommentSection from "../ui/CommentSection";

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
    PENDING_REVIEW:  "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED:        "bg-emerald-50 text-emerald-700 border-emerald-200",
    REVISION_NEEDED: "bg-red-50 text-red-700 border-red-200",
  };

  const statusLabels = {
    PENDING_REVIEW:  "Pending Review",
    APPROVED:        "Approved",
    REVISION_NEEDED: "Revision Needed",
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Reviews Center
          </h1>
          <p className="m-0 mt-1 text-slate-500 text-sm">
            Inspect submitted student deliverable files and approve milestones or request revisions.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg shrink-0 overflow-x-auto max-w-full">
          {["Pending", "History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setReviewTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                reviewTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
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
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-5 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Loading submissions...
          </div>
        ) : reviewTab === "Pending" ? (
          /* ── Pending Queue ── */
          pending.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              🎉 Excellent work! The review queue is empty.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {pending.map((sub) => {
                const isActioning = !!actionLoading[sub._id];
                return (
                  <div
                    key={sub._id}
                    className="border border-slate-200 rounded-xl p-6 flex flex-col gap-5 bg-slate-50"
                  >
                    {/* Header row */}
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <span className="text-slate-900 text-sm font-bold">
                          {sub.taskId?.title || "Task"}
                        </span>
                        <span className="block text-xs text-slate-500 mt-1">
                          Submitted by:{" "}
                          <span className="font-semibold text-slate-700">
                            {sub.submittedBy?.name || "Unknown"}
                          </span>
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5">
                          {sub.submittedAt
                            ? new Date(sub.submittedAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                          statusStyles[sub.status] || ""
                        }`}
                      >
                        {statusLabels[sub.status] || sub.status}
                      </span>
                    </div>

                    {/* Mentee notes */}
                    {sub.notes && (
                      <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1.5 tracking-wider">
                          Student Notes:
                        </span>
                        "{sub.notes}"
                      </div>
                    )}

                    {/* Submission content — smart display per type */}
                    {sub.submissionType === "file" && sub.fileUrl && (
                      <div className="flex flex-col gap-3">
                        {/* Inline image preview */}
                        {sub.mimeType && sub.mimeType.startsWith("image/") && (
                          <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
                            <img
                              src={sub.fileUrl}
                              alt="Submitted work"
                              className="w-full max-h-[400px] object-contain"
                              style={{ display: "block" }}
                            />
                          </div>
                        )}
                        {/* PDF open link */}
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors w-fit bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          {sub.mimeType?.startsWith("image/") ? "Open Full Image ↗" : "Open PDF ↗"}
                        </a>
                      </div>
                    )}

                    {/* URL submission — clickable chip */}
                    {sub.submissionType === "url" && sub.submissionUrl && (
                      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        <span className="text-sm font-medium text-blue-800 flex-1 truncate">
                          {sub.submissionUrl}
                        </span>
                        <a
                          href={sub.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors shrink-0"
                        >
                          Open Link ↗
                        </a>
                      </div>
                    )}

                    {/* Per-submission error */}
                    {actionError[sub._id] && (
                      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 shadow-sm">
                        ⚠️ {actionError[sub._id]}
                      </div>
                    )}

                    {/* Feedback textarea + action buttons */}
                    <div className="flex flex-col gap-3 mt-2">
                      <textarea
                        placeholder="Add feedback (required before approving or requesting revision)..."
                        value={feedbackMap[sub._id] || ""}
                        onChange={(e) =>
                          setFeedbackMap((prev) => ({
                            ...prev,
                            [sub._id]: e.target.value,
                          }))
                        }
                        className="px-4 py-3 text-sm rounded-lg border border-slate-300 outline-none w-full bg-white resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                        style={{ minHeight: 80 }}
                        disabled={isActioning}
                      />
                      <div className="flex flex-wrap sm:flex-nowrap gap-3 justify-end">
                        <Button
                          variant="danger"
                          onClick={() => handleRequestRevision(sub._id)}
                          disabled={isActioning}
                          className="w-full sm:w-auto justify-center text-sm py-2"
                        >
                          {actionLoading[sub._id] === "revision"
                            ? "Sending..."
                            : "Request Changes"}
                        </Button>
                        <Button
                          onClick={() => handleApprove(sub._id)}
                          disabled={isActioning}
                          className="w-full sm:w-auto justify-center text-sm py-2 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                        >
                          {actionLoading[sub._id] === "approve"
                            ? "Approving..."
                            : "Approve Deliverable"}
                        </Button>
                      </div>
                    </div>

                    {/* Comments on this submission */}
                    <CommentSection entityType="SUBMISSION" entityId={sub._id} />
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ── Review History tab ── */
          history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No graded submission history found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50">
                    {["Task Title", "Mentee", "File", "Status", "Feedback Given", "Date"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((sub) => (
                    <tr
                      key={sub._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm">
                        {sub.taskId?.title || "Task"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {sub.submittedBy?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        {sub.submissionType === "file" && sub.fileUrl ? (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                          >
                            {sub.mimeType?.startsWith("image/") ? "🖼 View Image ↗" : "📄 View PDF ↗"}
                          </a>
                        ) : sub.submissionType === "url" && sub.submissionUrl ? (
                          <a
                            href={sub.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                          >
                            🔗 Open Link ↗
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                            statusStyles[sub.status] || ""
                          }`}
                        >
                          {statusLabels[sub.status] || sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 italic max-w-xs truncate">
                        {sub.feedback ? `"${sub.feedback}"` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
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
