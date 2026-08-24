import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import CommentSection from "../ui/CommentSection";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  FileText,
  ExternalLink,
  Inbox,
} from "../ui/Icons";

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
    PENDING_REVIEW:  "bg-warning-50 text-warning-700 border-warning-200",
    APPROVED:        "bg-success-50 text-success-700 border-success-200",
    REVISION_NEEDED: "bg-danger-50 text-danger-700 border-danger-200",
  };

  const statusLabels = {
    PENDING_REVIEW:  "Pending Review",
    APPROVED:        "Approved",
    REVISION_NEEDED: "Revision Needed",
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="page-title m-0">Reviews</h1>
          <p className="page-subtitle mt-1">
            Inspect submitted deliverables, then approve them or request a revision.
          </p>
        </div>

        {/* Subtabs */}
        <div className="tab-strip max-w-full shrink-0 overflow-x-auto scrollbar-none">
          {["Pending", "History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setReviewTab(tab)}
              aria-pressed={reviewTab === tab}
              className={`tab-item ${reviewTab === tab ? "tab-item-active" : ""}`}
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
        <div className="notice notice-danger">
          <AlertTriangle size={16} className="mt-px shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="card flex flex-col gap-5 p-5 sm:p-6">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-5">
                <span className="skeleton h-5 w-48" />
                <span className="skeleton h-4 w-32" />
                <span className="skeleton h-20 w-full" />
                <span className="skeleton h-9 w-full" />
              </div>
            ))}
          </div>
        ) : reviewTab === "Pending" ? (
          /* ── Pending Queue ── */
          pending.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">
                <CheckCircle size={22} />
              </span>
              <p className="empty-state-title">Review queue is clear</p>
              <p className="empty-state-text">
                Nothing is waiting on you. New submissions from your mentees will land here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {pending.map((sub) => {
                const isActioning = !!actionLoading[sub._id];
                return (
                  <div
                    key={sub._id}
                    className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-slate-50/60 p-5"
                  >
                    {/* Header row */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="text-[14.5px] font-semibold text-slate-900">
                          {sub.taskId?.title || "Task"}
                        </span>
                        <span className="mt-1 block text-[12.5px] text-slate-500">
                          Submitted by:{" "}
                          <span className="font-semibold text-slate-700">
                            {sub.submittedBy?.name || "Unknown"}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[12.5px] text-slate-500">
                          {sub.submittedAt
                            ? new Date(sub.submittedAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      <span className={`badge ${statusStyles[sub.status] || "badge-neutral"}`}>
                        <span className="badge-dot" />
                        {statusLabels[sub.status] || sub.status}
                      </span>
                    </div>

                    {/* Mentee notes */}
                    {sub.notes && (
                      <div className="rounded-lg border border-slate-200 bg-white p-4 text-[13.5px] leading-relaxed text-slate-700">
                        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                          Student Notes
                        </span>
                        &ldquo;{sub.notes}&rdquo;
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
                          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-200
                            bg-white px-3 py-2 text-[13px] font-semibold text-brand-600 no-underline
                            transition-colors hover:border-brand-200 hover:bg-brand-50"
                        >
                          <FileText size={14} />
                          {sub.mimeType?.startsWith("image/") ? "Open full image" : "Open PDF"}
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    )}

                    {/* URL submission — clickable chip */}
                    {sub.submissionType === "url" && sub.submissionUrl && (
                      <div className="flex items-center gap-3 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3">
                        <ExternalLink size={16} className="shrink-0 text-brand-600" />
                        <span className="flex-1 truncate text-[13.5px] font-medium text-brand-800">
                          {sub.submissionUrl}
                        </span>
                        <a
                          href={sub.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-800"
                        >
                          Open link
                        </a>
                      </div>
                    )}

                    {/* Per-submission error */}
                    {actionError[sub._id] && (
                      <div className="notice notice-danger">
                        <AlertCircle size={16} className="mt-px shrink-0" />
                        <span>{actionError[sub._id]}</span>
                      </div>
                    )}

                    {/* Feedback textarea + action buttons */}
                    <div className="mt-1 flex flex-col gap-3">
                      <textarea
                        placeholder="Add feedback (required before approving or requesting revision)..."
                        value={feedbackMap[sub._id] || ""}
                        onChange={(e) =>
                          setFeedbackMap((prev) => ({
                            ...prev,
                            [sub._id]: e.target.value,
                          }))
                        }
                        aria-label="Review feedback"
                        className="textarea-field min-h-20 resize-none"
                        disabled={isActioning}
                      />
                      <div className="flex flex-wrap justify-end gap-3 sm:flex-nowrap">
                        <Button
                          variant="secondary"
                          onClick={() => handleRequestRevision(sub._id)}
                          disabled={isActioning}
                          className="w-full sm:w-auto"
                        >
                          {actionLoading[sub._id] === "revision"
                            ? "Sending..."
                            : "Request Changes"}
                        </Button>
                        <Button
                          variant="success"
                          onClick={() => handleApprove(sub._id)}
                          disabled={isActioning}
                          className="w-full sm:w-auto"
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
            <div className="empty-state">
              <span className="empty-state-icon">
                <Inbox size={22} />
              </span>
              <p className="empty-state-title">No review history yet</p>
              <p className="empty-state-text">
                Once you approve a submission or request a revision, the decision is recorded here.
              </p>
            </div>
          ) : (
            <div className="-mx-5 overflow-x-auto sm:-mx-6">
              <table className="data-table min-w-[700px]">
                <thead>
                  <tr>
                    {["Task Title", "Mentee", "File", "Status", "Feedback Given", "Date"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((sub) => (
                    <tr key={sub._id}>
                      <td className="font-semibold text-slate-900">
                        {sub.taskId?.title || "Task"}
                      </td>
                      <td>{sub.submittedBy?.name || "Unknown"}</td>
                      <td>
                        {sub.submissionType === "file" && sub.fileUrl ? (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-brand-600 transition-colors hover:text-brand-800"
                          >
                            <FileText size={14} />
                            {sub.mimeType?.startsWith("image/") ? "View image" : "View PDF"}
                          </a>
                        ) : sub.submissionType === "url" && sub.submissionUrl ? (
                          <a
                            href={sub.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-brand-600 transition-colors hover:text-brand-800"
                          >
                            <ExternalLink size={14} />
                            Open link
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${statusStyles[sub.status] || "badge-neutral"}`}>
                          <span className="badge-dot" />
                          {statusLabels[sub.status] || sub.status}
                        </span>
                      </td>
                      <td className="max-w-xs truncate italic text-slate-600">
                        {sub.feedback ? `“${sub.feedback}”` : "—"}
                      </td>
                      <td className="whitespace-nowrap text-slate-500">
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
