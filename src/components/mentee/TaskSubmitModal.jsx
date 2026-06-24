import { useState, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";

export default function TaskSubmitModal({ task, onClose, onSubmitSuccess }) {
  // ── Step A: File Upload state ──────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedUrl, setUploadedUrl]   = useState(""); // filled after upload
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading]       = useState(false);
  const [uploadError, setUploadError]   = useState(null);

  // ── Step B: Submit state ───────────────────────────────────────────────
  const [notes, setNotes]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fileInputRef = useRef(null);
  const { token } = useAuthStore();

  if (!task) return null;

  const isRevision = task.status === "REVISION_NEEDED";

  // Accepted file types per the guide
  const ACCEPTED_EXT = ".pdf,.zip,.png,.jpg,.jpeg,.docx";
  const ACCEPTED_TYPES = [
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // ── Step A: Select file ────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Invalid file type. Accepted: PDF, ZIP, PNG, JPG, JPEG, DOCX.");
      return;
    }
    setSelectedFile(file);
    setUploadedUrl("");
    setUploadError(null);
    setUploadProgress(0);
  };

  // ── Step A: Upload file → get Cloudinary URL ───────────────────────────
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
      // Must use multipart/form-data — NOT the api instance (which defaults to application/json)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );
      // Save the returned Cloudinary URL for Step B
      setUploadedUrl(response.data.data.url);
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

  // ── Step B: Submit work (only enabled after upload) ────────────────────
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!uploadedUrl) {
      setSubmitError("Please upload a file first before submitting.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.post("/submissions", {
        taskId:  task._id,
        fileUrl: uploadedUrl,     // URL from Step A
        notes:   notes.trim(),    // optional
      });
      // Task status auto-becomes SUBMITTED after this call
      onSubmitSuccess?.();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      style={{ background: "rgba(15,23,42,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 flex flex-col gap-5"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
      >
        {/* Title */}
        <div>
          <h2 className="m-0 mb-1 text-lg font-black text-slate-800">
            {isRevision ? "Resubmit Work" : "Submit Work"}
          </h2>
          <p className="m-0 text-slate-500 text-xs font-semibold">
            {task.title}
            {task.dueDate && (
              <>
                {" "}•{" "}
                <span className="text-red-500">
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Show mentor feedback when resubmitting */}
        {isRevision && task.feedback && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <div className="text-[10px] font-black text-red-500 uppercase mb-1">
              Mentor Feedback:
            </div>
            <div className="text-xs text-red-900 leading-relaxed">
              "{task.feedback}"
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitWork} className="flex flex-col gap-4">
          {/* ── Step A: File Picker + Upload ── */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Step 1: Upload File <span className="text-red-400">*</span>
            </label>

            {/* Drop zone / file picker */}
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 cursor-pointer hover:border-indigo-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="text-xs font-semibold text-slate-700">
                  📎 {selectedFile.name}{" "}
                  <span className="text-slate-400 font-normal">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-semibold">
                  Click to browse — PDF, ZIP, PNG, JPG, JPEG, DOCX
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

            {/* Upload button + progress bar (shown only before upload) */}
            {selectedFile && !uploadedUrl && (
              <div className="mt-2 flex flex-col gap-2">
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
                    : "☁️ Upload File"}
                </button>
              </div>
            )}

            {/* Upload success */}
            {uploadedUrl && (
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                ✅ File uploaded successfully!
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline ml-auto font-semibold"
                >
                  Preview ↗
                </a>
              </div>
            )}

            {uploadError && (
              <p className="mt-1.5 text-xs text-red-600 font-semibold">
                ⚠️ {uploadError}
              </p>
            )}
          </div>

          {/* ── Step B: Notes ── */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Step 2: Notes (Optional)
            </label>
            <textarea
              placeholder="Describe what you've done, any caveats, or links..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs outline-none resize-none focus:border-indigo-400 transition-colors font-sans bg-slate-50"
              style={{ minHeight: 80, boxSizing: "border-box" }}
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold">
              ⚠️ {submitError}
            </div>
          )}

          {/* Buttons */}
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
              disabled={!uploadedUrl || submitting}
              className="text-white border-0 rounded-xl font-bold text-xs cursor-pointer py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                flex: 2,
                background: uploadedUrl
                  ? "linear-gradient(135deg, #6366f1, #818cf8)"
                  : "#94a3b8",
                boxShadow: uploadedUrl
                  ? "0 4px 16px rgba(99,102,241,0.3)"
                  : "none",
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

          {/* Helper text when upload not done */}
          {!uploadedUrl && (
            <p className="text-[10px] text-slate-400 text-center font-semibold -mt-2">
              Upload your file first to enable the submit button
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
