import { useState, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
import Button from "../ui/Button";
import {
  Close,
  FileText,
  ExternalLink,
  Upload,
  Check,
  CheckCircle,
  AlertCircle,
  Clock,
  Refresh,
} from "../ui/Icons";
import { formatUIDate } from "../../lib/datetime";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Detect whether a Cloudinary URL is a PDF (stored under /pdfs/ folder) */
const isPDFUrl = (url = "") =>
  url.includes("/submissions/pdfs/") || url.endsWith(".pdf");

/** Detect whether a URL looks like a GitHub / external link (not Cloudinary) */
const isExternalUrl = (url = "") => !url.includes("res.cloudinary.com");

// ── Component ────────────────────────────────────────────────────────────────

export default function TaskSubmitModal({ task, onClose, onSubmitSuccess }) {
  // ── Submission mode ───────────────────────────────────────────────────────
  const [submissionMode, setSubmissionMode] = useState("file"); // "file" | "url"

  // ── File upload state (mode = 'file') ────────────────────────────────────
  const [selectedFile, setSelectedFile]     = useState(null);
  const [uploadedUrl, setUploadedUrl]       = useState("");
  const [uploadedMime, setUploadedMime]     = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading]           = useState(false);
  const [uploadError, setUploadError]       = useState(null);

  // ── URL submission state (mode = 'url') ──────────────────────────────────
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [urlError, setUrlError]           = useState(null);

  // ── Common ────────────────────────────────────────────────────────────────
  const [notes, setNotes]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fileInputRef = useRef(null);
  const { token } = useAuthStore();

  if (!task) return null;

  const isRevision = task.status === "REVISION_NEEDED";

  // Accepted file types — images and PDFs only
  const ACCEPTED_EXT   = ".pdf,.png,.jpg,.jpeg,.gif,.webp";
  const ACCEPTED_TYPES = [
    "application/pdf",
    "image/png", "image/jpeg", "image/gif",
    "image/webp", "image/bmp", "image/tiff",
  ];

  // ── Mode switch — reset upload state on switch ────────────────────────────
  const handleModeSwitch = (mode) => {
    setSubmissionMode(mode);
    setUploadError(null);
    setUrlError(null);
    setSubmitError(null);
  };

  // ── File: validate and select ─────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Invalid file type. Only images (JPG, PNG, GIF, WEBP) and PDF are accepted.");
      return;
    }
    setSelectedFile(file);
    setUploadedUrl("");
    setUploadedMime("");
    setUploadError(null);
    setUploadProgress(0);
  };

  // ── File: upload to Cloudinary via backend ────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file first.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (evt) => {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(percent);
          },
        }
      );
      setUploadedUrl(response.data.data.fileUrl);
      setUploadedMime(response.data.data.mimeType);
      setUploadProgress(100);
    } catch (err) {
      setUploadError(
        err.response?.data?.message || "File upload failed. Please try again."
      );
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // ── URL: basic client-side validation ────────────────────────────────────
  const validateUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (submissionMode === "file" && !uploadedUrl) {
      setSubmitError("Please upload a file first before submitting.");
      return;
    }
    if (submissionMode === "url") {
      if (!submissionUrl.trim()) {
        setUrlError("Please enter a URL before submitting.");
        return;
      }
      if (!validateUrl(submissionUrl.trim())) {
        setUrlError("Please enter a valid URL starting with http:// or https://");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        taskId:         task._id,
        submissionType: submissionMode,
        notes:          notes.trim(),
      };

      if (submissionMode === "file") {
        payload.fileUrl  = uploadedUrl;
        payload.mimeType = uploadedMime;
      } else {
        payload.submissionUrl = submissionUrl.trim();
      }

      await api.post("/submissions", payload);
      onSubmitSuccess?.();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const canSubmit =
    submissionMode === "file"
      ? !!uploadedUrl && !submitting
      : !!submissionUrl.trim() && !submitting;

  const isImage = uploadedMime && uploadedMime.startsWith("image/");
  const isPDF   = uploadedMime === "application/pdf" || isPDFUrl(uploadedUrl);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-950/45 p-0 backdrop-blur-[2px] animate-fade-in sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex w-full max-h-[92vh] flex-col rounded-t-3xl border border-slate-200/60 bg-white shadow-xl animate-slide-up sm:max-w-lg sm:rounded-2xl">

        {/* ── Modal Header ─────────────────────────────────────────────── */}
        <div className="px-6 pt-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="m-0 font-display text-[17px] font-bold tracking-tight text-slate-900">
                {isRevision ? "Resubmit Work" : "Submit Work"}
              </h2>
              <p className="m-0 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-500">
                <span className="font-medium text-slate-700">{task.title}</span>
                {task.dueDate && (
                  <span className="inline-flex items-center gap-1 text-danger-600">
                    <Clock size={13} />
                    Due {formatUIDate(new Date(task.dueDate))}
                  </span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Close size={17} />
            </button>
          </div>

          {/* Mentor feedback banner (revision mode) */}
          {isRevision && task.feedback && (
            <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50/70 p-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-warning-700">
                <Refresh size={13} /> Mentor Feedback
              </div>
              <div className="text-[13px] leading-relaxed text-warning-800">
                &ldquo;{task.feedback}&rdquo;
              </div>
            </div>
          )}

          {/* ── Submission Mode Tabs ─────────────────────────────────── */}
          <div className="tab-strip mt-5 grid w-full grid-cols-2">
            <button
              type="button"
              onClick={() => handleModeSwitch("file")}
              aria-pressed={submissionMode === "file"}
              className={`tab-item flex items-center justify-center gap-1.5 ${
                submissionMode === "file" ? "tab-item-active" : ""
              }`}
            >
              <FileText size={14} />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("url")}
              aria-pressed={submissionMode === "url"}
              className={`tab-item flex items-center justify-center gap-1.5 ${
                submissionMode === "url" ? "tab-item-active" : ""
              }`}
            >
              <ExternalLink size={14} />
              Submit URL
            </button>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmitWork}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6 pt-5 scrollbar-slim sm:px-7"
        >

          {/* ══ FILE UPLOAD MODE ══════════════════════════════════════════ */}
          {submissionMode === "file" && (
            <div className="flex flex-col gap-3">
              <label className="field-label m-0">
                Upload Image or PDF <span className="text-danger-600">*</span>
              </label>

              {/* Drop zone */}
              <div
                className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                  uploadedUrl
                    ? "border-success-300 bg-success-50/40"
                    : "border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/40"
                }`}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-slate-700">
                    <FileText size={15} className="text-slate-400" />
                    <span className="truncate">{selectedFile.name}</span>
                    <span className="font-normal text-slate-400">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={22} className="text-slate-400" />
                    <span className="text-[13px] font-medium text-slate-500">
                      Click to browse — image or PDF only
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXT}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Upload button + progress */}
              {selectedFile && !uploadedUrl && (
                <div className="flex flex-col gap-2">
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      `Uploading… ${uploadProgress}%`
                    ) : (
                      <>
                        <Upload size={16} /> Upload file
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Upload success + inline preview */}
              {uploadedUrl && (
                <div className="flex flex-col gap-2">
                  <div className="notice notice-success items-center">
                    <CheckCircle size={16} className="shrink-0" />
                    <span className="font-semibold">Uploaded successfully</span>
                    <a
                      href={uploadedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
                    >
                      Open <ExternalLink size={13} />
                    </a>
                  </div>

                  {/* Image inline preview */}
                  {isImage && (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={uploadedUrl}
                        alt="Uploaded preview"
                        className="block max-h-48 w-full object-contain"
                      />
                    </div>
                  )}

                  {/* PDF preview chip */}
                  {isPDF && (
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <FileText size={15} className="shrink-0 text-danger-500" />
                      <span className="flex-1 truncate text-[13px] font-semibold text-slate-700">
                        {selectedFile?.name || "Document.pdf"}
                      </span>
                      <a
                        href={uploadedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-brand-600 hover:underline"
                      >
                        Preview <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <p className="field-error m-0 flex items-start gap-1.5">
                  <AlertCircle size={14} className="mt-px shrink-0" />
                  {uploadError}
                </p>
              )}
            </div>
          )}

          {/* ══ URL SUBMISSION MODE ═══════════════════════════════════════ */}
          {submissionMode === "url" && (
            <div className="flex flex-col gap-3">
              <label className="field-label m-0">
                Submission URL <span className="text-danger-600">*</span>
              </label>
              <div className="relative">
                <ExternalLink
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => {
                    setSubmissionUrl(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://github.com/username/repo"
                  className={`input-field pl-10 ${urlError ? "input-field-error" : ""}`}
                  disabled={submitting}
                />
              </div>

              {urlError && (
                <p className="field-error m-0 flex items-start gap-1.5">
                  <AlertCircle size={14} className="mt-px shrink-0" />
                  {urlError}
                </p>
              )}

              {/* URL preview chip */}
              {submissionUrl && validateUrl(submissionUrl) && (
                <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2.5">
                  <Check size={15} className="shrink-0 text-brand-600" />
                  <span className="flex-1 truncate text-[13px] font-medium text-brand-700">
                    {submissionUrl}
                  </span>
                  <a
                    href={submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-brand-600 hover:underline"
                  >
                    Open <ExternalLink size={13} />
                  </a>
                </div>
              )}

              <p className="field-hint m-0">
                Paste your GitHub repository URL, deployed project link, Figma design, Google
                Drive, or any public URL.
              </p>
            </div>
          )}

          {/* ── Notes (common to both modes) ──────────────────────────── */}
          <div>
            <label className="field-label">
              Notes <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              placeholder="Describe what you've done, list key changes, or add any caveats…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea-field min-h-20"
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="notice notice-danger">
              <AlertCircle size={16} className="mt-px shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* ── Action buttons ────────────────────────────────────────── */}
          <div className="mt-1 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit} className="flex-[2]">
              {submitting
                ? "Submitting…"
                : isRevision
                ? "Resubmit for Review"
                : "Submit for Review"}
            </Button>
          </div>

          {/* Helper hint */}
          {!canSubmit && !submitting && (
            <p className="-mt-1 text-center text-[12px] text-slate-500">
              {submissionMode === "file"
                ? "Upload a file first to enable submit"
                : "Enter a valid URL to enable submit"}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
