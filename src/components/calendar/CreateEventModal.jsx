import { useState, useEffect } from "react";
import { Close, AlertTriangle, AlertCircle, Inbox, Calendar } from "../ui/Icons";
import api from "../../lib/api";
import { useCalendarStore } from "../../store/calendarStore";
import { toast } from "react-toastify";
import { toLocalInput } from "../../lib/datetime";

const COLOR_PRESETS = [
  { name: "EduFlow Blue", hex: "#4A90D9" },
  { name: "Orange", hex: "#E67E22" },
  { name: "Purple", hex: "#8E44AD" },
  { name: "Green", hex: "#27AE60" },
  { name: "Red", hex: "#E74C3C" },
  { name: "Yellow", hex: "#F1C40F" },
];

export default function CreateEventModal({ isOpen, onClose, defaultDate }) {
  const { addEvent } = useCalendarStore();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Default to the clicked day at local midnight, or "now" in local time — both
  // formatted for a datetime-local input so the value shown is the value saved.
  const initialDateStr = defaultDate
    ? toLocalInput(new Date(`${defaultDate}T00:00`))
    : toLocalInput(new Date());

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: initialDateStr,
    endDate: "",
    isAllDay: false,
    color: "#4A90D9",
  });

  useEffect(() => {
    if (!isOpen) return;
    const fetchMembers = async () => {
      try {
        const res = await api.get("/users/workspace-members");
        setMembers(res.data.data.users || []);
        setSelectedMembers([]); // Reset selected members
      } catch (err) {
        console.error("Failed to fetch workspace members:", err);
      }
    };
    fetchMembers();
  }, [isOpen]);

  // All hooks are declared above, so bailing out here keeps hook order stable.
  if (!isOpen) return null;

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
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("End date cannot be before start date");
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
        sharedWith: selectedMembers,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/45 backdrop-blur-[2px] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-scale-in">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600">
              <Calendar size={16} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 m-0">Add Custom Event</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold bg-transparent border-0 cursor-pointer p-1 rounded-lg"
          >
            <Close size={16} />
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
              className="rounded border-slate-300 text-brand-600 focus:ring-indigo-500"
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
                min={formData.isAllDay ? formData.startDate.slice(0, 10) : formData.startDate}
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

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Share with Members
            </label>
            {members.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No other members in your organization.</div>
            ) : (
              <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1.5">
                {members.map((member) => (
                  <label key={member._id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers((prev) => [...prev, member._id]);
                        } else {
                          setSelectedMembers((prev) => prev.filter((id) => id !== member._id));
                        }
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{member.name} <span className="text-slate-400 font-normal">({member.role.toLowerCase()})</span></span>
                  </label>
                ))}
              </div>
            )}
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
