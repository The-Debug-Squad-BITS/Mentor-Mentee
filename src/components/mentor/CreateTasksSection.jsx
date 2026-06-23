import { useState } from "react";
import StatusBadge from "../ui/StatusBadge";

const inputClass =
  "w-full px-3 py-2.5 md:px-3.5 md:py-3 rounded-xl border border-slate-200 text-xs md:text-sm outline-none transition-colors focus:border-indigo-400 bg-white";

export default function CreateTasksSection({ tasks, onCreateTask }) {
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [selectedMentee, setSelectedMentee] = useState("");

  const menteesList = [];

  const handleCreate = () => {
    if (!desc || !selectedMentee) {
      alert("Please provide a description and select a mentee.");
      return;
    }
    onCreateTask({ desc, deadline, priority, menteeId: selectedMentee });
    setDesc("");
    setDeadline("");
    setPriority("Medium");
    setSelectedMentee("");
  };

  return (
    <div
      className="ml-0 md:ml-4 lg:ml-8 bg-white rounded-2xl p-4 md:p-6 lg:p-8 border border-slate-100 mb-5 md:mb-6 lg:mb-8"
      style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.07)" }}
    >
      <h2 className="m-0 mb-4 md:mb-5 lg:mb-6 text-base md:text-lg lg:text-xl font-black text-slate-800">
        Create New Task
      </h2>

      <div className="flex flex-col gap-4 md:gap-5">
        {/* Row 1 — Title + Mentee */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
          <div className="flex-1">
            <label className="block text-[11px] md:text-xs font-semibold text-slate-500 mb-1.5">
              Task Title / Description
            </label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Task description…"
              className={inputClass}
              style={{ fontFamily: "inherit" }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] md:text-xs font-semibold text-slate-500 mb-1.5">
              Assign To Mentee
            </label>
            <select
              value={selectedMentee}
              onChange={(e) => setSelectedMentee(e.target.value)}
              className={inputClass}
              style={{ fontFamily: "inherit" }}
            >
              <option value="">-- Choose Mentee --</option>
              {menteesList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 — Deadline + Priority */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
          <div className="flex-1">
            <label className="block text-[11px] md:text-xs font-semibold text-slate-500 mb-1.5">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
              style={{ fontFamily: "inherit" }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] md:text-xs font-semibold text-slate-500 mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={inputClass}
              style={{ fontFamily: "inherit" }}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-[11px] md:text-xs font-semibold text-slate-500 mb-1.5">
            Attachments
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 md:p-6 lg:p-8 text-center text-slate-400 cursor-pointer hover:border-indigo-400 transition-colors">
            <svg
              width="20"
              height="20"
              className="mx-auto mb-2 md:mb-3 md:w-6 md:h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            <span className="text-[11px] md:text-xs font-medium">
              Drag & drop files here or click to upload
            </span>
          </div>
        </div>

        {/* Link guideline */}
        <div>
          <label className="block text-[11px] md:text-xs font-semibold text-slate-500 mb-1.5">
            (Optional) Link Guideline
          </label>
          <input
            placeholder="https://…"
            className={inputClass}
            style={{ fontFamily: "inherit" }}
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleCreate}
          className="self-start border-0 rounded-xl
            px-4 py-2.5 text-xs
            md:px-5 md:py-3 md:text-sm
            lg:px-6 lg:py-3.5
            font-bold text-white cursor-pointer mt-1 md:mt-2"
          style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
            fontFamily: "inherit",
          }}
        >
          Create Task
        </button>
      </div>

      {/* ── Created tasks list ── */}
      <h3 className="mt-6 md:mt-7 lg:mt-8 mb-3 md:mb-4 text-sm md:text-base font-black text-slate-800">
        Created Tasks
      </h3>
      {tasks.length === 0 ? (
        <p className="text-slate-500 text-xs md:text-sm">
          No tasks created yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5 md:gap-3">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3
                px-3.5 py-3 md:px-4 md:py-4
                bg-slate-50 rounded-xl border border-slate-200"
            >
              <div>
                <div className="font-bold text-slate-800 text-xs md:text-sm">
                  {t.title}
                </div>
                <div className="text-[11px] md:text-xs text-slate-500 mt-0.5">
                  Assigned to: {t.assigneeName || t.mentee} • Deadline: {t.deadline}
                </div>
              </div>
              <div className="self-start sm:self-auto">
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
