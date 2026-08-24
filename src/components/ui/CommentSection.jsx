import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns initials from a name string */
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

/** Maps a name to a consistent accent color */
const AVATAR_COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#f59e0b", "#10b981", "#06b6d4", "#ef4444",
];
function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Format a date string to a human-readable relative time */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ── Mini Avatar ──────────────────────────────────────────────────────────────
function CommentAvatar({ name, size = 32 }) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.375,
        lineHeight: 1,
      }}
    >
      {initials}
    </div>
  );
}

// ── Single Comment (recursive for replies) ────────────────────────────────────
function CommentItem({ comment, entityType, entityId, currentUser, onRefresh, depth = 0 }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editLoading, setEditLoading] = useState(false);

  const authorName = comment.authorId?.name || "Unknown";
  const authorId = comment.authorId?._id || comment.authorId;

  const canEdit = currentUser?._id === authorId;
  const canDelete = canEdit || currentUser?.role === "ADMIN";

  // ── Post a reply ───────────────────────────────────────────────────────────
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      await api.post("/comments", {
        content: replyContent.trim(),
        entityType,
        entityId,
        parentCommentId: comment._id,
      });
      setReplyContent("");
      setShowReplyBox(false);
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to post reply.";
      toast.error(msg);
    } finally {
      setReplyLoading(false);
    }
  };

  // ── Edit a comment ─────────────────────────────────────────────────────────
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      await api.patch(`/comments/${comment._id}`, { content: editContent.trim() });
      setEditing(false);
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to edit comment.";
      toast.error(msg);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete a comment ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;
    try {
      await api.delete(`/comments/${comment._id}`);
      onRefresh();
    } catch (err) {
      toast.error("Failed to delete comment.");
    }
  };

  const isReply = depth > 0;

  return (
    <div className={`flex gap-3 ${isReply ? "ml-10 mt-3" : ""}`}>
      <CommentAvatar name={authorName} size={isReply ? 28 : 34} />

      <div className="flex-1 min-w-0">
        {/* Comment bubble */}
        <div
          className={`rounded-xl px-4 py-3 ${
            isReply
              ? "bg-slate-50 border border-slate-200"
              : "bg-white border border-slate-200 shadow-sm"
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-sm font-bold text-slate-900">{authorName}</span>
            {comment.isEdited && (
              <span className="text-[10px] text-slate-400 font-medium italic">(edited)</span>
            )}
            <span className="text-xs text-slate-400 ml-auto">{formatDate(comment.createdAt)}</span>
          </div>

          {/* Content or Edit form */}
          {editing ? (
            <form onSubmit={handleEdit} className="flex flex-col gap-2 mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="textarea-field resize-none"
                style={{ minHeight: 72 }}
                disabled={editLoading}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={editLoading || !editContent.trim()}
                  className="px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors cursor-pointer border-0"
                >
                  {editLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setEditContent(comment.content); }}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer border-0"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed m-0 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>

        {/* Action row */}
        {!editing && (
          <div className="flex items-center gap-3 mt-1.5 px-1">
            {/* Reply — only on top-level */}
            {!isReply && (
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="text-xs text-slate-500 hover:text-brand-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                {showReplyBox ? "Cancel" : "Reply"}
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-slate-500 hover:text-brand-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-xs text-slate-500 hover:text-red-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Delete
              </button>
            )}
          </div>
        )}

        {/* Reply form */}
        {showReplyBox && !isReply && (
          <form onSubmit={handleReply} className="flex gap-2 mt-3">
            <CommentAvatar name={currentUser?.name || ""} size={28} />
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="textarea-field resize-none bg-white"
                style={{ minHeight: 60 }}
                disabled={replyLoading}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={replyLoading || !replyContent.trim()}
                  className="px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors cursor-pointer border-0"
                >
                  {replyLoading ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="flex flex-col gap-0 mt-1">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                entityType={entityType}
                entityId={entityId}
                currentUser={currentUser}
                onRefresh={onRefresh}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main CommentSection Export ────────────────────────────────────────────────

/**
 * Drop-in threaded comment section.
 *
 * Props:
 *   entityType  — "TASK" | "SUBMISSION" | "MILESTONE" | "PROJECT"
 *   entityId    — MongoDB ObjectId string of the entity
 */
export default function CommentSection({ entityType, entityId }) {
  const { user } = useAuthStore();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  // ── Load comments ──────────────────────────────────────────────────────────
  const loadComments = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    try {
      const response = await api.get("/comments", {
        params: { entityType, entityId },
      });
      setComments(response.data.data.comments || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // ── Post top-level comment ─────────────────────────────────────────────────
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostLoading(true);
    try {
      await api.post("/comments", {
        content: newComment.trim(),
        entityType,
        entityId,
        parentCommentId: null,
      });
      setNewComment("");
      loadComments();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to post comment.";
      toast.error(msg);
    } finally {
      setPostLoading(false);
    }
  };

  const totalCount = comments.reduce(
    (sum, c) => sum + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <div className="card overflow-hidden">
      {/* Section header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <h3 className="m-0 text-sm font-bold text-slate-900">
          Comments
          {totalCount > 0 && (
            <span className="ml-1.5 text-xs text-slate-500 font-medium">({totalCount})</span>
          )}
        </h3>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {/* New comment form */}
        <form onSubmit={handlePostComment} className="flex gap-3 items-start">
          <CommentAvatar name={user?.name || ""} size={34} />
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="input-field resize-none transition-colors bg-slate-50 focus:bg-white"
              style={{ minHeight: 80 }}
              disabled={postLoading}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={postLoading || !newComment.trim()}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors cursor-pointer border-0 shadow-sm"
              >
                {postLoading ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </form>

        {/* Divider */}
        {totalCount > 0 && (
          <div className="border-t border-slate-100" />
        )}

        {/* Comments list */}
        {loading ? (
          <div className="text-center text-slate-400 text-sm py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-4">
            No comments yet. Be the first to add one!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                entityType={entityType}
                entityId={entityId}
                currentUser={user}
                onRefresh={loadComments}
                depth={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
