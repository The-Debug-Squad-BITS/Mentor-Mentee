import { useState } from "react";
import api from "../../lib/api";
import { useCalendarStore } from "../../store/calendarStore";
import { toast } from "react-toastify";

const COLOR_PRESETS = [
  { name: "EduFlow Blue", hex: "#4A90D9" },
  { name: "Orange", hex: "#E67E22" },
  { name: "Purple", hex: "#8E44AD" },
  { name: "Green", hex: "#27AE60" },
  { name: "Red", hex: "#E74C3C" },
  { name: "Yellow", hex: "#F1C40F" },
];

export default function CreateEventModal({ isOpen, onClose, defaultDate }) {
  if (!isOpen) return null;

  const { addEvent } = useCalendarStore();
  const [loading, setLoading] = useState(false);

  // Default start date formatted for datetime-local input
  const initialDateStr = defaultDate
    ? new Date(defaultDate).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: initialDateStr,
    endDate: "",
    isAllDay: false,
    color: "#4A90D9",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }
    if (!formData.startDate) {
      toast.error("Please select a start date");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        isAllDay: formData.isAllDay,
        color: formData.color,
      };

      const res = await api.post("/calendar", payload);
      const createdEvent = res.data.data.event;

      addEvent(createdEvent);
      toast.success("Event created successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to create event:", err);
      const msg = err.response?.data?.message || "Failed to create event";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              📅
            </div>
            <h2 className="text-lg font-bold text-slate-800 m-0">Add Custom Event</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold bg-transparent border-0 cursor-pointer p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Team Planning Session"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Optional notes or details..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="isAllDay"
              name="isAllDay"
              checked={formData.isAllDay}
              onChange={handleChange}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isAllDay" className="text-xs font-medium text-slate-700 cursor-pointer">
              All day event
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Start Date {formData.isAllDay ? "" : "& Time"} <span className="text-red-500">*</span>
              </label>
              <input
                type={formData.isAllDay ? "date" : "datetime-local"}
                name="startDate"
                value={formData.isAllDay ? formData.startDate.slice(0, 10) : formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                End Date {formData.isAllDay ? "" : "& Time"}
              </label>
              <input
                type={formData.isAllDay ? "date" : "datetime-local"}
                name="endDate"
                value={formData.isAllDay && formData.endDate ? formData.endDate.slice(0, 10) : formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Event Color Tag
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, color: preset.hex }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                    formData.color === preset.hex
                      ? "border-slate-800 scale-110 shadow-sm"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                />
              ))}
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-7 h-7 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                title="Custom color picker"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border-0 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors border-0 cursor-pointer shadow-md shadow-indigo-100"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
