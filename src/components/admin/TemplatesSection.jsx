import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useTemplateStore } from "../../store/templateStore";
import Button from "../ui/Button";
import { toast } from "react-toastify";

// ── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

/** Returns a fresh blank milestone object for the builder */
const blankMilestone = () => ({
  _key: Date.now() + Math.random(),
  title: "",
  description: "",
  order: "",
  tasks: [],
});

/** Returns a fresh blank task object */
const blankTask = (milestoneKey = null) => ({
  _key: Date.now() + Math.random(),
  milestoneKey,      // null → standalone task
  title: "",
  description: "",
  priority: "MEDIUM",
});

// ── Template Builder sub-component ───────────────────────────────────────────

function TemplateBuilder({ milestones, standaloneTasks, onMilestonesChange, onStandaloneTasksChange }) {

  // ── Milestone helpers ─────────────────────────────────────────────────
  const addMilestone = () => onMilestonesChange([...milestones, blankMilestone()]);

  const removeMilestone = (key) => {
    onMilestonesChange(milestones.filter(m => m._key !== key));
  };

  const updateMilestone = (key, field, value) => {
    onMilestonesChange(milestones.map(m => m._key === key ? { ...m, [field]: value } : m));
  };

  const addTaskToMilestone = (milestoneKey) => {
    onMilestonesChange(milestones.map(m =>
      m._key === milestoneKey ? { ...m, tasks: [...m.tasks, blankTask(milestoneKey)] } : m
    ));
  };

  const removeTaskFromMilestone = (milestoneKey, taskKey) => {
    onMilestonesChange(milestones.map(m =>
      m._key === milestoneKey ? { ...m, tasks: m.tasks.filter(t => t._key !== taskKey) } : m
    ));
  };

  const updateMilestoneTask = (milestoneKey, taskKey, field, value) => {
    onMilestonesChange(milestones.map(m =>
      m._key === milestoneKey
        ? { ...m, tasks: m.tasks.map(t => t._key === taskKey ? { ...t, [field]: value } : t) }
        : m
    ));
  };

  // ── Standalone task helpers ───────────────────────────────────────────
  const addStandaloneTask = () => onStandaloneTasksChange([...standaloneTasks, blankTask(null)]);

  const removeStandaloneTask = (key) => {
    onStandaloneTasksChange(standaloneTasks.filter(t => t._key !== key));
  };

  const updateStandaloneTask = (key, field, value) => {
    onStandaloneTasksChange(standaloneTasks.map(t => t._key === key ? { ...t, [field]: value } : t));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Milestones section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="m-0 text-sm font-bold text-slate-700">
            Milestones ({milestones.length})
          </h4>
          <button
            type="button"
            onClick={addMilestone}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
          >
            + Add Milestone
          </button>
        </div>

        {milestones.length === 0 && (
          <p className="text-xs text-slate-400 italic">No milestones yet. Add one to group tasks by phase.</p>
        )}

        {milestones.map((m, mIdx) => (
          <div key={m._key} className="border border-slate-300 rounded-xl p-4 bg-white flex flex-col gap-4">
            {/* Milestone header */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {mIdx + 1}
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  value={m.title}
                  onChange={e => updateMilestone(m._key, "title", e.target.value)}
                  placeholder="Milestone title *"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <input
                  type="number"
                  value={m.order}
                  onChange={e => updateMilestone(m._key, "order", e.target.value)}
                  placeholder="Order (e.g. 1)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <input
                  value={m.description}
                  onChange={e => updateMilestone(m._key, "description", e.target.value)}
                  placeholder="Description (optional)"
                  className="sm:col-span-2 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => removeMilestone(m._key)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent shrink-0"
                title="Remove milestone"
              >
                ✕
              </button>
            </div>

            {/* Milestone tasks */}
            <div className="ml-9 flex flex-col gap-2">
              {m.tasks.map((t) => (
                <div key={t._key} className="flex items-center gap-2">
                  <div className="w-4 border-l-2 border-b-2 border-slate-200 h-4 shrink-0 rounded-bl-md" />
                  <input
                    required
                    value={t.title}
                    onChange={e => updateMilestoneTask(m._key, t._key, "title", e.target.value)}
                    placeholder="Task title *"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <select
                    value={t.priority}
                    onChange={e => updateMilestoneTask(m._key, t._key, "priority", e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-blue-500 bg-white transition-colors"
                  >
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeTaskFromMilestone(m._key, t._key)}
                    className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:text-red-600 cursor-pointer border-0 bg-transparent text-sm shrink-0"
                  >✕</button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTaskToMilestone(m._key)}
                className="self-start text-xs text-slate-500 hover:text-blue-600 font-medium cursor-pointer bg-transparent border-0 transition-colors"
              >
                + Add task to milestone
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Standalone tasks section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="m-0 text-sm font-bold text-slate-700">
            Standalone Tasks ({standaloneTasks.length})
          </h4>
          <button
            type="button"
            onClick={addStandaloneTask}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            + Add Task
          </button>
        </div>

        {standaloneTasks.length === 0 && (
          <p className="text-xs text-slate-400 italic">No standalone tasks yet. These are tasks not linked to any milestone.</p>
        )}

        {standaloneTasks.map((t) => (
          <div key={t._key} className="flex items-center gap-2">
            <input
              required
              value={t.title}
              onChange={e => updateStandaloneTask(t._key, "title", e.target.value)}
              placeholder="Task title *"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <input
              value={t.description}
              onChange={e => updateStandaloneTask(t._key, "description", e.target.value)}
              placeholder="Description (optional)"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <select
              value={t.priority}
              onChange={e => updateStandaloneTask(t._key, "priority", e.target.value)}
              className="px-2 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 bg-white transition-colors"
            >
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              type="button"
              onClick={() => removeStandaloneTask(t._key)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer border-0 bg-transparent transition-colors shrink-0"
            >✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Template Detail View ──────────────────────────────────────────────────────

function TemplateDetail({ template, isAdmin, onBack, onRefresh, onCreateProject }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={onBack}
            className="w-10 h-10 p-0 flex items-center justify-center text-lg rounded-lg"
          >
            ←
          </Button>
          <div>
            <h2 className="m-0 text-lg font-bold text-slate-900">{template.name}</h2>
            <p className="m-0 mt-1 text-slate-500 text-sm">Template detail view</p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => onCreateProject(template)}
            className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white shrink-0"
          >
            🚀 Create Project from Template
          </Button>
        )}
      </div>

      {/* Description */}
      {template.description && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="m-0 mb-2 text-sm font-bold text-slate-700 uppercase tracking-wide">Description</h3>
          <p className="m-0 text-slate-700 text-sm leading-relaxed">{template.description}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
          <span className="block text-3xl font-bold text-indigo-600">{template.milestones?.length || 0}</span>
          <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Milestones</span>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
          <span className="block text-3xl font-bold text-blue-600">
            {(template.milestones || []).reduce((s, m) => s + (m.tasks?.length || 0), 0)}
          </span>
          <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Milestone Tasks</span>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
          <span className="block text-3xl font-bold text-emerald-600">{template.tasks?.length || 0}</span>
          <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Standalone Tasks</span>
        </div>
      </div>

      {/* Milestones breakdown */}
      {template.milestones && template.milestones.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="m-0 text-sm font-bold text-slate-900">Milestones</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {template.milestones.map((m, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-md flex items-center justify-center text-xs font-bold shrink-0">
                    {m.order || i + 1}
                  </div>
                  <span className="font-semibold text-slate-900 text-sm">{m.title}</span>
                  {m.tasks && m.tasks.length > 0 && (
                    <span className="ml-auto text-xs text-slate-500">{m.tasks.length} task{m.tasks.length !== 1 ? "s" : ""}</span>
                  )}
                </div>
                {m.description && (
                  <p className="text-xs text-slate-500 ml-9 m-0 mb-2">{m.description}</p>
                )}
                {m.tasks && m.tasks.length > 0 && (
                  <div className="ml-9 flex flex-col gap-1.5">
                    {m.tasks.map((t, ti) => (
                      <div key={ti} className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">└</span>
                        <span className="text-slate-700 font-medium">{t.title}</span>
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                          t.priority === "HIGH" ? "bg-red-50 text-red-700 border-red-200" :
                          t.priority === "LOW" ? "bg-slate-100 text-slate-600 border-slate-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {t.priority || "MEDIUM"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standalone tasks */}
      {template.tasks && template.tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="m-0 text-sm font-bold text-slate-900">Standalone Tasks</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {template.tasks.map((t, i) => (
              <div key={i} className="px-6 py-3 flex items-center gap-3">
                <span className="text-slate-400 text-sm">#{i + 1}</span>
                <span className="text-sm font-medium text-slate-800 flex-1">{t.title}</span>
                {t.description && (
                  <span className="text-xs text-slate-500 truncate max-w-[200px]">{t.description}</span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide shrink-0 ${
                  t.priority === "HIGH" ? "bg-red-50 text-red-700 border-red-200" :
                  t.priority === "LOW" ? "bg-slate-100 text-slate-600 border-slate-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {t.priority || "MEDIUM"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create-Project-from-Template Modal ────────────────────────────────────────

function CreateProjectFromTemplateModal({ template, mentors, mentees, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startDate || !endDate) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/templates/${template._id}/create-project`, {
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate,
        mentorId: mentorId || undefined,
        mentees: selectedMentees.length > 0 ? selectedMentees : undefined,
      });
      const { project, milestonesCreated, tasksCreated } = response.data.data;
      setResult({ project, milestonesCreated, tasksCreated });
      toast.success(`Project "${project.title}" created from template!`);
      if (onSuccess) onSuccess(project);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create project from template.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMentee = (id) => {
    setSelectedMentees(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200] p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="px-8 pt-8 pb-4 border-b border-slate-100">
          <h2 className="m-0 text-xl font-bold text-slate-900">Create Project from Template</h2>
          <p className="m-0 mt-1 text-slate-500 text-sm">
            Using template: <strong className="text-indigo-600">{template.name}</strong>
          </p>
        </div>

        {result ? (
          /* Success state */
          <div className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="m-0 text-lg font-bold text-slate-900">Project Created!</h3>
              <p className="m-0 mt-2 text-slate-500 text-sm">
                <strong className="text-slate-700">"{result.project.title}"</strong> has been set up with:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                <span className="block text-2xl font-bold text-indigo-600">{result.milestonesCreated}</span>
                <span className="block text-xs text-indigo-700 font-semibold mt-1 uppercase tracking-wide">Milestones</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <span className="block text-2xl font-bold text-blue-600">{result.tasksCreated}</span>
                <span className="block text-xs text-blue-700 font-semibold mt-1 uppercase tracking-wide">Tasks</span>
              </div>
            </div>
            <Button onClick={onClose} className="w-full justify-center">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Project Title *</label>
              <input
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. ML Research Project - Batch 2026"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Description *</label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe this project..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
                style={{ minHeight: 72 }}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Start Date *</label>
                <input
                  required
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-colors"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">End Date *</label>
                <input
                  required
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Assign Mentor (optional)</label>
              <select
                value={mentorId}
                onChange={e => setMentorId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-colors"
                disabled={loading}
              >
                <option value="">-- No Mentor --</option>
                {mentors.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Assign Mentees ({selectedMentees.length} selected)
              </label>
              <div className="border border-slate-300 rounded-lg p-3 max-h-36 overflow-y-auto flex flex-col gap-1.5 bg-white">
                {mentees.length === 0 ? (
                  <span className="text-xs text-slate-400 italic py-1">No mentees found.</span>
                ) : (
                  mentees.map(m => (
                    <label key={m._id} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedMentees.includes(m._id)}
                        onChange={() => toggleMentee(m._id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                        disabled={loading}
                      />
                      <span className="text-sm font-medium text-slate-800">{m.name}</span>
                      <span className="text-xs text-slate-500 ml-auto">{m.email}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500">
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main TemplatesSection Export ──────────────────────────────────────────────

export default function TemplatesSection() {
  const { user } = useAuthStore();
  const { templates, setTemplates, currentTemplate, setCurrentTemplate } = useTemplateStore();

  const isAdmin = user?.role === "ADMIN";
  const isMentor = user?.role === "MENTOR";
  const canView = isAdmin || isMentor;

  // ── List + detail state ───────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Create / edit form state ──────────────────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formMilestones, setFormMilestones] = useState([]);
  const [formStandaloneTasks, setFormStandaloneTasks] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // ── Create-from-template modal state ─────────────────────────────────
  const [createProjectFor, setCreateProjectFor] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);

  // ── Load templates ────────────────────────────────────────────────────
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/templates", { params: { limit: 50 } });
      setTemplates(response.data.data.templates || []);
    } catch (err) {
      setError("Failed to load templates.");
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  }, [setTemplates]);

  // ── Load mentors/mentees for the create-from-template modal ──────────
  const loadUsersForModal = useCallback(async () => {
    try {
      const [mr, mee] = await Promise.all([
        api.get("/users", { params: { role: "MENTOR", limit: 100 } }),
        api.get("/users", { params: { role: "MENTEE", limit: 100 } }),
      ]);
      setMentors(mr.data.data.users || []);
      setMentees(mee.data.data.users || []);
    } catch (err) {
      console.error("Error loading users for modal:", err);
    }
  }, []);

  useEffect(() => {
    if (canView) {
      loadTemplates();
      if (isAdmin) loadUsersForModal();
    }
    return () => setCurrentTemplate(null);
  }, [canView, isAdmin, loadTemplates, loadUsersForModal, setCurrentTemplate]);

  // ── Serialise builder state → API payload ─────────────────────────────
  const buildPayload = () => ({
    milestones: formMilestones
      .filter(m => m.title.trim())
      .map(m => ({
        title: m.title.trim(),
        description: m.description.trim() || undefined,
        order: m.order ? parseInt(m.order, 10) : undefined,
        tasks: m.tasks
          .filter(t => t.title.trim())
          .map(t => ({
            title: t.title.trim(),
            description: t.description?.trim() || undefined,
            priority: t.priority || "MEDIUM",
          })),
      })),
    tasks: formStandaloneTasks
      .filter(t => t.title.trim())
      .map(t => ({
        title: t.title.trim(),
        description: t.description?.trim() || undefined,
        priority: t.priority || "MEDIUM",
      })),
  });

  // ── Create template ───────────────────────────────────────────────────
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setFormLoading(true);
    try {
      await api.post("/templates", {
        name: formName.trim(),
        description: formDesc.trim() || undefined,
        ...buildPayload(),
      });
      toast.success("Template created successfully!");
      resetForm();
      setShowCreateForm(false);
      loadTemplates();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create template.";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Update template ───────────────────────────────────────────────────
  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    if (!editingTemplate || !formName.trim()) return;
    setFormLoading(true);
    try {
      await api.patch(`/templates/${editingTemplate._id}`, {
        name: formName.trim(),
        description: formDesc.trim() || undefined,
        ...buildPayload(),
      });
      toast.success("Template updated!");
      resetForm();
      setEditingTemplate(null);
      loadTemplates();
      // Refresh detail if viewing
      if (currentTemplate?._id === editingTemplate._id) {
        const r = await api.get(`/templates/${editingTemplate._id}`);
        setCurrentTemplate(r.data.data.template);
      }
    } catch (err) {
      toast.error("Failed to update template.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete template ───────────────────────────────────────────────────
  const handleDeleteTemplate = async (templateId) => {
    const confirmed = window.confirm("Delete this template? This cannot be undone.");
    if (!confirmed) return;
    try {
      await api.delete(`/templates/${templateId}`);
      toast.success("Template deleted.");
      if (currentTemplate?._id === templateId) setCurrentTemplate(null);
      loadTemplates();
    } catch (err) {
      toast.error("Failed to delete template.");
    }
  };

  // ── Open template detail ──────────────────────────────────────────────
  const openDetail = async (template) => {
    try {
      const r = await api.get(`/templates/${template._id}`);
      setCurrentTemplate(r.data.data.template);
    } catch {
      setCurrentTemplate(template); // fallback
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormMilestones([]);
    setFormStandaloneTasks([]);
  };

  const startEdit = (template) => {
    setEditingTemplate(template);
    setFormName(template.name || "");
    setFormDesc(template.description || "");
    // Reconstruct builder state from saved template
    setFormMilestones(
      (template.milestones || []).map(m => ({
        _key: Date.now() + Math.random(),
        title: m.title || "",
        description: m.description || "",
        order: m.order?.toString() || "",
        tasks: (m.tasks || []).map(t => ({
          _key: Date.now() + Math.random(),
          title: t.title || "",
          description: t.description || "",
          priority: t.priority || "MEDIUM",
        })),
      }))
    );
    setFormStandaloneTasks(
      (template.tasks || []).map(t => ({
        _key: Date.now() + Math.random(),
        title: t.title || "",
        description: t.description || "",
        priority: t.priority || "MEDIUM",
      }))
    );
    setShowCreateForm(false);
    setCurrentTemplate(null);
  };

  // ── Gate for non-admin/mentor ─────────────────────────────────────────
  if (!canView) {
    return (
      <div className="bg-white rounded-xl p-10 border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
        You do not have access to view templates.
      </div>
    );
  }

  // ── Template detail view ──────────────────────────────────────────────
  if (currentTemplate && !editingTemplate) {
    return (
      <>
        <TemplateDetail
          template={currentTemplate}
          isAdmin={isAdmin}
          onBack={() => setCurrentTemplate(null)}
          onRefresh={loadTemplates}
          onCreateProject={(t) => setCreateProjectFor(t)}
        />
        {createProjectFor && isAdmin && (
          <CreateProjectFromTemplateModal
            template={createProjectFor}
            mentors={mentors}
            mentees={mentees}
            onClose={() => setCreateProjectFor(null)}
            onSuccess={() => setCreateProjectFor(null)}
          />
        )}
      </>
    );
  }

  // ── Templates list view ───────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="m-0 text-lg font-bold text-slate-900 tracking-tight">Project Templates</h2>
          <p className="m-0 mt-1 text-slate-500 text-sm">
            Reusable blueprints for projects with pre-defined milestones and tasks.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => { setShowCreateForm(!showCreateForm); setEditingTemplate(null); resetForm(); }}
          >
            {showCreateForm ? "Cancel" : "+ New Template"}
          </Button>
        )}
      </div>

      {/* Create / Edit form */}
      {(showCreateForm || editingTemplate) && isAdmin && (
        <form
          onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
          className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 flex flex-col gap-6 shadow-sm"
        >
          <h3 className="m-0 text-base font-bold text-slate-900">
            {editingTemplate ? "Edit Template" : "Create New Template"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Template Name *</label>
              <input
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. ML Research Project Template"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Description</label>
              <input
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Optional description..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                disabled={formLoading}
              />
            </div>
          </div>

          {/* Builder */}
          <div className="border border-indigo-200 rounded-xl p-5 bg-white">
            <TemplateBuilder
              milestones={formMilestones}
              standaloneTasks={formStandaloneTasks}
              onMilestonesChange={setFormMilestones}
              onStandaloneTasksChange={setFormStandaloneTasks}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={formLoading}>
              {formLoading ? "Saving..." : editingTemplate ? "Update Template" : "Save Template"}
            </Button>
            {editingTemplate && (
              <Button type="button" variant="secondary" onClick={() => { setEditingTemplate(null); resetForm(); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {/* Templates list */}
      {loading ? (
        <div className="p-10 text-center text-slate-500 text-sm">Loading templates...</div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 text-sm">{error}</div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl p-10 border border-slate-200 text-center shadow-sm">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-500 text-sm m-0">
            {isAdmin
              ? "No templates yet. Create your first template to speed up project setup."
              : "No templates available yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((t) => {
            const milestoneCount = t.milestones?.length || 0;
            const milestoneTaskCount = (t.milestones || []).reduce((s, m) => s + (m.tasks?.length || 0), 0);
            const standaloneCount = t.tasks?.length || 0;
            const totalTasks = milestoneTaskCount + standaloneCount;

            return (
              <div
                key={t._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col gap-4"
                onClick={() => openDetail(t)}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 9h6M9 12h6M9 15h4" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="m-0 text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {t.name}
                      </h3>
                      {t.description && (
                        <p className="m-0 mt-0.5 text-xs text-slate-500 truncate">{t.description}</p>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => startEdit(t)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer border-0"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(t._id)}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer border-0"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                    <span><strong className="text-slate-800">{milestoneCount}</strong> milestone{milestoneCount !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <span><strong className="text-slate-800">{totalTasks}</strong> task{totalTasks !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="ml-auto">
                    {isAdmin && (
                      <button
                        onClick={e => { e.stopPropagation(); setCreateProjectFor(t); }}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                      >
                        🚀 Use Template
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project from Template modal */}
      {createProjectFor && isAdmin && (
        <CreateProjectFromTemplateModal
          template={createProjectFor}
          mentors={mentors}
          mentees={mentees}
          onClose={() => setCreateProjectFor(null)}
          onSuccess={() => setCreateProjectFor(null)}
        />
      )}
    </div>
  );
}
