import { useState } from "react";
import api from "../../lib/api";
import { useCalendarStore } from "../../store/calendarStore";
import { toast } from "react-toastify";

const EVENT_TYPE_BADGES = {
  TASK_DEADLINE: { label: "Task Deadline", bg: "bg-amber-100 text-amber-800 border-amber-200", defaultColor: "#E67E22" },
  MILESTONE_DEADLINE: { label: "Milestone Deadline", bg: "bg-purple-100 text-purple-800 border-purple-200", defaultColor: "#8E44AD" },
  MEETING: { label: "Meeting", bg: "bg-emerald-100 text-emerald-800 border-emerald-200", defaultColor: "#27AE60" },
  CUSTOM: { label: "Custom Event", bg: "bg-blue-100 text-blue-800 border-blue-200", defaultColor: "#4A90D9" },
};

export default function EventDetailModal({ event, onClose }) {
  const { updateEventInStore, removeEventFromStore } = useCalendarStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit form state. Optional-chained so every hook stays unconditional even
  // before the null-event bail-out below (fixes the rules-of-hooks crash).
  const [editForm, setEditForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
    isAllDay: !!event?.isAllDay,
    color: event?.color || "#4A90D9",
  });

  if (!event) return null;

  const isCustom = event.eventType === "CUSTOM";
  const badgeInfo = EVENT_TYPE_BADGES[event.eventType] || EVENT_TYPE_BADGES.CUSTOM;

  const formatDate = (isoString, isAllDay) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isAllDay) {
      return date.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    }
    return date.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete this custom event?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.delete(`/calendar/${event._id}`);
      removeEventFromStore(event._id);
      toast.success("Event deleted");
      onClose();
    } catch (err) {
      console.error("Failed to delete event:", err);
      const msg = err.response?.data?.message || "Failed to delete event";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setLoading(true);
      const patch = {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : undefined,
        endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : undefined,
        isAllDay: editForm.isAllDay,
        color: editForm.color,
      };

      const res = await api.patch(`/calendar/${event._id}`, patch);
      const updated = res.data.data.event;

      updateEventInStore(updated);
      toast.success("Event updated successfully!");
      setIsEditing(false);
      onClose();
    } catch (err) {
      console.error("Failed to update event:", err);
      const msg = err.response?.data?.message || "Failed to update event";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block"
              style={{ backgroundColor: event.color || badgeInfo.defaultColor }}
            />
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold bg-transparent border-0 cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {!isEditing ? (
          <div>
            <h3 className="text-xl font-bold text-slate-800 m-0 mb-3">{event.title}</h3>

            <div className="space-y-2 mb-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold w-16 text-xs">Start:</span>
                <span className="font-medium text-slate-700">{formatDate(event.startDate, event.isAllDay)}</span>
              </div>
              {event.endDate && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold w-16 text-xs">End:</span>
                  <span className="font-medium text-slate-700">{formatDate(event.endDate, event.isAllDay)}</span>
                </div>
              )}
              {event.isAllDay && (
                <div className="inline-block text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                  All-day event
                </div>
              )}
            </div>

            {event.description && (
              <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                <div className="text-xs font-semibold text-slate-400 mb-1">Description</div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap m-0">{event.description}</p>
              </div>
            )}

            {!isCustom && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-xs mb-4 border border-amber-200">
                ℹ️ Auto-generated deadline/meeting event. Created from system entities.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {isCustom && (
                <>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border-0 cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors border-0 cursor-pointer shadow-sm"
                  >
                    Edit Event
                  </button>
                </>
              )}
              {!isCustom && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border-0 cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsAllDay"
                checked={editForm.isAllDay}
                onChange={(e) => setEditForm({ ...editForm, isAllDay: e.target.checked })}
              />
              <label htmlFor="editIsAllDay" className="text-xs font-medium text-slate-700 cursor-pointer">
                All day event
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                <input
                  type={editForm.isAllDay ? "date" : "datetime-local"}
                  value={editForm.isAllDay ? editForm.startDate.slice(0, 10) : editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                <input
                  type={editForm.isAllDay ? "date" : "datetime-local"}
                  value={editForm.isAllDay && editForm.endDate ? editForm.endDate.slice(0, 10) : editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Color Tag</label>
              <input
                type="color"
                value={editForm.color}
                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 border-0 cursor-pointer shadow-sm"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
