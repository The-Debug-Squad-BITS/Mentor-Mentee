import { useState, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
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
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      style={{ background: "rgba(15,23,42,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl flex flex-col"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.18)", maxHeight: "90vh" }}
      >
        {/* ── Modal Header ─────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 pb-0">
          <h2 className="m-0 mb-0.5 text-lg font-black text-slate-800">
            {isRevision ? "Resubmit Work" : "Submit Work"}
          </h2>
          <p className="m-0 text-slate-500 text-xs font-semibold">
            {task.title}
            {task.dueDate && (
              <>
                {" "}•{" "}
                <span className="text-red-500">
                  Due {formatUIDate(new Date(task.dueDate))}
                </span>
              </>
            )}
          </p>

          {/* Mentor feedback banner (revision mode) */}
          {isRevision && task.feedback && (
            <div className="mt-4 bg-red-50 border border-red-200 p-3.5 rounded-xl">
              <div className="text-[10px] font-black text-red-500 uppercase mb-1">
                Mentor Feedback:
              </div>
              <div className="text-xs text-red-900 leading-relaxed">
                "{task.feedback}"
              </div>
            </div>
          )}

          {/* ── Submission Mode Tabs ─────────────────────────────────── */}
          <div className="mt-5 flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleModeSwitch("file")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                submissionMode === "file"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Upload File
              <span className="text-[9px] font-semibold opacity-60">(Image / PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("url")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                submissionMode === "url"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Submit URL
              <span className="text-[9px] font-semibold opacity-60">(GitHub / Link)</span>
            </button>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────── */}
        <form onSubmit={handleSubmitWork} className="flex flex-col gap-4 p-6 sm:p-8 pt-5 overflow-y-auto flex-1">

          {/* ══ FILE UPLOAD MODE ══════════════════════════════════════════ */}
          {submissionMode === "file" && (
            <div className="flex flex-col gap-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Upload Image or PDF <span className="text-red-400">*</span>
              </label>

              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  uploadedUrl
                    ? "border-emerald-300 bg-emerald-50/30"
                    : "border-slate-300 bg-slate-50 hover:border-indigo-400"
                }`}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="text-xs font-semibold text-slate-700">
                    📎 {selectedFile.name}{" "}
                    <span className="text-slate-400 font-normal">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span className="text-xs text-slate-400 font-semibold">
                      Click to browse — Image or PDF only
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
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs border-none cursor-pointer transition-colors disabled:opacity-60"
                    style={{ fontFamily: "inherit" }}
                  >
                    {uploading
                      ? `Uploading... ${uploadProgress}%`
                      : "☁️ Upload to Cloudinary"}
                  </button>
                </div>
              )}

              {/* Upload success + inline preview */}
              {uploadedUrl && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                    ✅ Uploaded successfully!
                    <a
                      href={uploadedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline ml-auto font-semibold"
                    >
                      Open ↗
                    </a>
                  </div>

                  {/* Image inline preview */}
                  {isImage && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={uploadedUrl}
                        alt="Uploaded preview"
                        className="w-full max-h-48 object-contain"
                        style={{ display: "block" }}
                      />
                    </div>
                  )}

                  {/* PDF preview chip */}
                  {isPDF && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <span className="text-xs font-bold text-red-600 flex-1 truncate">
                        {selectedFile?.name || "Document.pdf"}
                      </span>
                      <a
                        href={uploadedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 font-bold hover:underline shrink-0"
                      >
                        Preview PDF ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-red-600 font-semibold">
                  ⚠️ {uploadError}
                </p>
              )}
            </div>
          )}

          {/* ══ URL SUBMISSION MODE ═══════════════════════════════════════ */}
          {submissionMode === "url" && (
            <div className="flex flex-col gap-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Submission URL <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => {
                    setSubmissionUrl(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://github.com/username/repo"
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 transition-colors font-sans bg-slate-50"
                  disabled={submitting}
                />
              </div>

              {urlError && (
                <p className="text-xs text-red-600 font-semibold">⚠️ {urlError}</p>
              )}

              {/* URL preview chip */}
              {submissionUrl && validateUrl(submissionUrl) && (
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <span className="text-xs font-semibold text-indigo-700 flex-1 truncate">
                    {submissionUrl}
                  </span>
                  <a
                    href={submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 font-bold hover:underline shrink-0"
                  >
                    Open ↗
                  </a>
                </div>
              )}

              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Paste your GitHub repository URL, deployed project link, Figma design, Google Drive, or any public URL.
              </p>
            </div>
          )}

          {/* ── Notes (common to both modes) ──────────────────────────── */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Notes <span className="text-slate-300 font-normal">(Optional)</span>
            </label>
            <textarea
              placeholder="Describe what you've done, list key changes, or add any caveats..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs outline-none resize-none focus:border-indigo-400 transition-colors font-sans bg-slate-50"
              style={{ minHeight: 70, boxSizing: "border-box" }}
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold">
              ⚠️ {submitError}
            </div>
          )}

          {/* ── Action buttons ────────────────────────────────────────── */}
          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 border border-slate-200 bg-white rounded-xl font-bold text-xs text-slate-500 cursor-pointer hover:border-slate-300 transition-colors"
              style={{ fontFamily: "inherit" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="text-white border-0 rounded-xl font-bold text-xs cursor-pointer py-3 transition-all disabled:cursor-not-allowed"
              style={{
                flex: 2,
                background: canSubmit
                  ? "linear-gradient(135deg, #6366f1, #818cf8)"
                  : "#94a3b8",
                boxShadow: canSubmit ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
                opacity: canSubmit ? 1 : 0.6,
                fontFamily: "inherit",
              }}
            >
              {submitting
                ? "Submitting..."
                : isRevision
                ? "Resubmit for Review"
                : "Submit for Review"}
            </button>
          </div>

          {/* Helper hint */}
          {!canSubmit && !submitting && (
            <p className="text-[10px] text-slate-400 text-center font-semibold -mt-2">
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
