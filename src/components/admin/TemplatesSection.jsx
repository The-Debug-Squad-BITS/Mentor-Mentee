import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useTemplateStore } from "../../store/templateStore";
import Button from "../ui/Button";
import StatCard from "../ui/StatCard";
import {
  ArrowLeft,
  Plus,
  Close,
  Trash,
  Edit,
  Layers,
  Flag,
  CheckCircle,
  AlertTriangle,
  Lock,
  Sparkle,
} from "../ui/Icons";
import { toast } from "react-toastify";

// ── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

/** Badge tone per priority — keeps the pill identical everywhere it appears. */
const PRIORITY_BADGE = {
  HIGH: "badge-danger",
  MEDIUM: "badge-warning",
  LOW: "badge-neutral",
};

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

// ── Presentational primitives (local to this file) ───────────────────────────

/** Priority pill — dot + label so status is never carried by colour alone. */
function PriorityBadge({ priority }) {
  const value = priority || "MEDIUM";
  return (
    <span className={`badge ${PRIORITY_BADGE[value] || "badge-warning"}`}>
      <span className="badge-dot" />
      {value}
    </span>
  );
}

/** Small numbered chip used for milestone ordering. */
function OrderChip({ children }) {
  return (
    <span className="w-6 h-6 shrink-0 rounded-md bg-brand-50 border border-brand-100 text-brand-700 text-[11px] font-bold flex items-center justify-center tabular-nums">
      {children}
    </span>
  );
}

/** Icon-only destructive control used inside the builder rows. */
function RemoveButton({ onClick, label, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`shrink-0 inline-flex items-center justify-center rounded-lg border border-transparent bg-transparent text-slate-500 cursor-pointer transition-colors hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200 ${className}`}
    >
      <Trash size={15} />
    </button>
  );
}

/** Inline spinner for buttons in a pending state. */
function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
    />
  );
}

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
    <div className="flex flex-col gap-8">
      {/* Milestones section */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-slate-500" />
            <h4 className="m-0 font-display text-[13px] font-bold tracking-tight text-slate-900">
              Milestones
            </h4>
            <span className="badge badge-neutral tabular-nums">{milestones.length}</span>
          </div>
          <Button type="button" variant="subtle" size="sm" onClick={addMilestone}>
            <Plus size={15} />
            Add milestone
          </Button>
        </div>

        {milestones.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-7 text-center">
            <p className="m-0 text-[13px] text-slate-500 leading-relaxed">
              No milestones yet. Add one to group tasks by phase.
            </p>
          </div>
        )}

        {milestones.map((m, mIdx) => (
          <div key={m._key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col gap-4">
            {/* Milestone header */}
            <div className="flex items-start gap-3">
              <div className="mt-8 hidden sm:block">
                <OrderChip>{mIdx + 1}</OrderChip>
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="field-label">Milestone title *</label>
                  <input
                    required
                    value={m.title}
                    onChange={e => updateMilestone(m._key, "title", e.target.value)}
                    placeholder="e.g. Literature review"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="field-label">Order</label>
                  <input
                    type="number"
                    value={m.order}
                    onChange={e => updateMilestone(m._key, "order", e.target.value)}
                    placeholder="1"
                    className="input-field"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="field-label">Description</label>
                  <input
                    value={m.description}
                    onChange={e => updateMilestone(m._key, "description", e.target.value)}
                    placeholder="What this phase covers (optional)"
                    className="input-field"
                  />
                </div>
              </div>
              <RemoveButton
                onClick={() => removeMilestone(m._key)}
                label="Remove milestone"
                className="w-9 h-9 mt-7"
              />
            </div>

            {/* Milestone tasks */}
            <div className="sm:ml-9 pl-4 border-l border-slate-200 flex flex-col gap-2">
              {m.tasks.map((t) => (
                <div key={t._key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    required
                    value={t.title}
                    onChange={e => updateMilestoneTask(m._key, t._key, "title", e.target.value)}
                    placeholder="Task title *"
                    className="input-field flex-1 py-2"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={t.priority}
                      onChange={e => updateMilestoneTask(m._key, t._key, "priority", e.target.value)}
                      className="select-field w-full sm:w-36 py-2 text-[13px]"
                      aria-label="Task priority"
                    >
                      {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <RemoveButton
                      onClick={() => removeTaskFromMilestone(m._key, t._key)}
                      label="Remove task"
                      className="w-8 h-8"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTaskToMilestone(m._key)}
                className="self-start inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-brand-700 cursor-pointer bg-transparent border-0 p-0 transition-colors"
              >
                <Plus size={14} />
                Add task to milestone
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Standalone tasks section */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-slate-500" />
            <h4 className="m-0 font-display text-[13px] font-bold tracking-tight text-slate-900">
              Standalone tasks
            </h4>
            <span className="badge badge-neutral tabular-nums">{standaloneTasks.length}</span>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addStandaloneTask}>
            <Plus size={15} />
            Add task
          </Button>
        </div>

        {standaloneTasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-7 text-center">
            <p className="m-0 text-[13px] text-slate-500 leading-relaxed">
              No standalone tasks yet. These are tasks not linked to any milestone.
            </p>
          </div>
        )}

        {standaloneTasks.map((t) => (
          <div key={t._key} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              required
              value={t.title}
              onChange={e => updateStandaloneTask(t._key, "title", e.target.value)}
              placeholder="Task title *"
              className="input-field flex-1"
            />
            <input
              value={t.description}
              onChange={e => updateStandaloneTask(t._key, "description", e.target.value)}
              placeholder="Description (optional)"
              className="input-field flex-1"
            />
            <div className="flex items-center gap-2">
              <select
                value={t.priority}
                onChange={e => updateStandaloneTask(t._key, "priority", e.target.value)}
                className="select-field w-full sm:w-36 text-[13px]"
                aria-label="Task priority"
              >
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <RemoveButton
                onClick={() => removeStandaloneTask(t._key)}
                label="Remove task"
                className="w-9 h-9"
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// ── Template Detail View ──────────────────────────────────────────────────────

function TemplateDetail({ template, isAdmin, onBack, onRefresh, onCreateProject }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="card px-5 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Button
            variant="secondary"
            onClick={onBack}
            className="w-10 h-10 p-0 shrink-0"
            aria-label="Back to templates"
            title="Back to templates"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="min-w-0">
            <p className="eyebrow m-0">Template</p>
            <h2 className="page-title m-0 mt-1 truncate">{template.name}</h2>
            <p className="page-subtitle m-0 mt-1">
              Everything this blueprint creates when it is applied to a project.
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => onCreateProject(template)}
            className="shrink-0 w-full sm:w-auto"
          >
            <Sparkle size={16} />
            Create project from template
          </Button>
        )}
      </div>

      {/* Description */}
      {template.description && (
        <div className="card card-body">
          <h3 className="section-title m-0 mb-2">Description</h3>
          <p className="m-0 text-sm text-slate-700 leading-relaxed">{template.description}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Flag size={18} />}
          label="Milestones"
          value={template.milestones?.length || 0}
        />
        <StatCard
          icon={<Layers size={18} />}
          label="Milestone tasks"
          value={(template.milestones || []).reduce((s, m) => s + (m.tasks?.length || 0), 0)}
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          label="Standalone tasks"
          value={template.tasks?.length || 0}
        />
      </div>

      {/* Milestones breakdown */}
      {template.milestones && template.milestones.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="section-title m-0">Milestones</h3>
            <span className="badge badge-neutral tabular-nums">{template.milestones.length}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {template.milestones.map((m, i) => (
              <div key={i} className="px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3 mb-2">
                  <OrderChip>{m.order || i + 1}</OrderChip>
                  <span className="font-semibold text-slate-900 text-sm truncate">{m.title}</span>
                  {m.tasks && m.tasks.length > 0 && (
                    <span className="ml-auto shrink-0 text-[12px] text-slate-500">
                      {m.tasks.length} task{m.tasks.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {m.description && (
                  <p className="text-[13px] text-slate-500 ml-9 m-0 mb-2 leading-relaxed">{m.description}</p>
                )}
                {m.tasks && m.tasks.length > 0 && (
                  <div className="ml-9 pl-4 border-l border-slate-200 flex flex-col gap-2">
                    {m.tasks.map((t, ti) => (
                      <div key={ti} className="flex items-center gap-3 text-sm">
                        <span className="text-slate-700 font-medium truncate">{t.title}</span>
                        <span className="ml-auto shrink-0">
                          <PriorityBadge priority={t.priority} />
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
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="section-title m-0">Standalone tasks</h3>
            <span className="badge badge-neutral tabular-nums">{template.tasks.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  <th>Task</th>
                  <th>Description</th>
                  <th className="text-right">Priority</th>
                </tr>
              </thead>
              <tbody>
                {template.tasks.map((t, i) => (
                  <tr key={i}>
                    <td className="text-slate-500 tabular-nums">{i + 1}</td>
                    <td className="font-medium text-slate-900">{t.title}</td>
                    <td className="text-slate-600 max-w-xs truncate">
                      {t.description ? t.description : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="text-right">
                      <PriorityBadge priority={t.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  const [bulkCount, setBulkCount] = useState(1);
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
        bulkCount,
      });
      const { project, milestonesCreated, tasksCreated } = response.data.data;
      setResult({ project, milestonesCreated, tasksCreated });
      if (bulkCount > 1) {
        toast.success(`${bulkCount} projects created from template!`);
      } else {
        toast.success(`Project "${project.title}" created from template!`);
      }
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
      className="modal-backdrop z-[200]"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-panel max-w-lg">
        <div className="modal-header border-b border-slate-200/70">
          <div className="min-w-0">
            <h2 className="section-title m-0 text-base">Create project from template</h2>
            <p className="m-0 mt-1 text-[13px] text-slate-500">
              Using template: <strong className="font-semibold text-brand-700">{template.name}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
            className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-lg border-0 bg-transparent text-slate-500 cursor-pointer transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Close size={18} />
          </button>
        </div>

        {result ? (
          /* Success state */
          <div className="px-6 py-6 flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <span className="w-12 h-12 rounded-full bg-success-50 border border-success-200 text-success-600 flex items-center justify-center">
                <CheckCircle size={24} />
              </span>
              <div>
                <h3 className="m-0 font-display text-base font-bold text-slate-900">
                  {bulkCount > 1 ? `${bulkCount} projects created` : "Project created"}
                </h3>
                <p className="m-0 mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                  {bulkCount > 1 ? (
                    <>
                      Projects starting with{" "}
                      <strong className="font-semibold text-slate-900">"{result.project.title}"</strong> have been set up with:
                    </>
                  ) : (
                    <>
                      <strong className="font-semibold text-slate-900">"{result.project.title}"</strong> has been set up with:
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center">
                <span className="block font-display text-2xl font-bold text-brand-700 tabular-nums">{result.milestonesCreated}</span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-700 mt-1">Milestones</span>
              </div>
              <div className="rounded-xl border border-info-200 bg-info-50 p-4 text-center">
                <span className="block font-display text-2xl font-bold text-info-700 tabular-nums">{result.tasksCreated}</span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-info-700 mt-1">Tasks</span>
              </div>
            </div>
            <Button onClick={onClose} className="w-full justify-center">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="px-6 py-5 flex flex-col gap-5">
              {error && (
                <div className="notice notice-danger" role="alert">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="field-label">Project title *</label>
                <input
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. ML Research Project - Batch 2026"
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="field-label">Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe this project..."
                  className="textarea-field min-h-20"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Start date *</label>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="input-field"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="field-label">End date *</label>
                  <input
                    required
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Assign mentor</label>
                <select
                  value={mentorId}
                  onChange={e => setMentorId(e.target.value)}
                  className="select-field"
                  disabled={loading}
                >
                  <option value="">-- No Mentor --</option>
                  {mentors.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
                <p className="field-hint">Optional — a mentor can be assigned later.</p>
              </div>

              <div>
                <label className="field-label">
                  Assign mentees ({selectedMentees.length} selected)
                </label>
                <div className="border border-slate-300 rounded-lg shadow-xs p-2 max-h-40 overflow-y-auto scrollbar-slim flex flex-col gap-0.5 bg-white">
                  {mentees.length === 0 ? (
                    <span className="text-[13px] text-slate-500 px-2 py-3 text-center">No mentees available yet.</span>
                  ) : (
                    mentees.map(m => (
                      <label key={m._id} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-md transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedMentees.includes(m._id)}
                          onChange={() => toggleMentee(m._id)}
                          className="w-4 h-4 rounded border-slate-300 accent-brand-600 cursor-pointer shrink-0"
                          disabled={loading}
                        />
                        <span className="text-[13px] font-medium text-slate-800 truncate">{m.name}</span>
                        <span className="text-[12px] text-slate-500 ml-auto truncate">{m.email}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="template-bulk-count" className="field-label">
                  Number of projects to create
                </label>
                <input
                  id="template-bulk-count"
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={bulkCount}
                  onChange={e => setBulkCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  className="input-field"
                  disabled={loading}
                />
                <p className="field-hint">Create up to 50 projects from this template at once.</p>
              </div>
            </div>

            <div className="modal-footer">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Spinner />}
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Loading placeholder for the template grid ────────────────────────────────

function TemplateCardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="skeleton h-3.5 w-2/5" />
          <div className="skeleton h-3 w-3/5" />
        </div>
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-center gap-4">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-7 w-28 rounded-lg ml-auto" />
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
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Lock size={20} />
          </div>
          <p className="empty-state-title">Templates are restricted</p>
          <p className="empty-state-text">
            You do not have access to view templates. Ask an administrator if you think this is a mistake.
          </p>
        </div>
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
      <div className="card px-5 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0">
          <p className="eyebrow m-0">Library</p>
          <h2 className="page-title m-0 mt-1">Project templates</h2>
          <p className="page-subtitle m-0 mt-1">
            Reusable blueprints for projects, with pre-defined milestones and tasks.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => { setShowCreateForm(!showCreateForm); setEditingTemplate(null); resetForm(); }}
            variant={showCreateForm ? "secondary" : "primary"}
            className="shrink-0 w-full sm:w-auto"
          >
            {showCreateForm ? <Close size={16} /> : <Plus size={16} />}
            {showCreateForm ? "Cancel" : "New template"}
          </Button>
        )}
      </div>

      {/* Create / Edit form */}
      {(showCreateForm || editingTemplate) && isAdmin && (
        <form
          onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
          className="card overflow-hidden animate-slide-up"
        >
          <div className="card-header">
            <div>
              <h3 className="section-title m-0">
                {editingTemplate ? "Edit template" : "New template"}
              </h3>
              <p className="m-0 mt-0.5 text-[13px] text-slate-500">
                Name the blueprint, then add the milestones and tasks it should create.
              </p>
            </div>
            <span className={`badge ${editingTemplate ? "badge-warning" : "badge-brand"}`}>
              <span className="badge-dot" />
              {editingTemplate ? "Editing" : "Draft"}
            </span>
          </div>

          <div className="card-body flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label">Template name *</label>
                <input
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. ML Research Project Template"
                  className="input-field"
                  disabled={formLoading}
                />
              </div>
              <div>
                <label className="field-label">Description</label>
                <input
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="What this template is for (optional)"
                  className="input-field"
                  disabled={formLoading}
                />
              </div>
            </div>

            {/* Builder */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <TemplateBuilder
                milestones={formMilestones}
                standaloneTasks={formStandaloneTasks}
                onMilestonesChange={setFormMilestones}
                onStandaloneTasksChange={setFormStandaloneTasks}
              />
            </div>
          </div>

          <div className="modal-footer">
            {editingTemplate && (
              <Button type="button" variant="secondary" onClick={() => { setEditingTemplate(null); resetForm(); }}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={formLoading}>
              {formLoading && <Spinner />}
              {formLoading ? "Saving..." : editingTemplate ? "Update Template" : "Save Template"}
            </Button>
          </div>
        </form>
      )}

      {/* Templates list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-busy="true">
          {[0, 1, 2, 3].map(i => <TemplateCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="notice notice-danger" role="alert">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Layers size={20} />
            </div>
            <p className="empty-state-title">No templates yet</p>
            <p className="empty-state-text">
              {isAdmin
                ? "Create your first template to pre-load new projects with milestones and tasks."
                : "No templates have been published yet. They will appear here once an administrator adds one."}
            </p>
            {isAdmin && (
              <Button
                className="mt-4"
                onClick={() => { setShowCreateForm(true); setEditingTemplate(null); resetForm(); }}
              >
                <Plus size={16} />
                New template
              </Button>
            )}
          </div>
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
                className="card-interactive p-5 cursor-pointer group flex flex-col gap-4"
                onClick={() => openDetail(t)}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                      <Layers size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="m-0 font-display text-[15px] font-bold tracking-tight text-slate-900 truncate group-hover:text-brand-700 transition-colors">
                        {t.name}
                      </h3>
                      {t.description && (
                        <p className="m-0 mt-0.5 text-[13px] text-slate-500 truncate">{t.description}</p>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => startEdit(t)}
                        title="Edit template"
                        aria-label={`Edit ${t.name}`}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-transparent bg-transparent text-slate-500 cursor-pointer transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(t._id)}
                        title="Delete template"
                        aria-label={`Delete ${t.name}`}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-transparent bg-transparent text-slate-500 cursor-pointer transition-colors hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto pt-3 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-600">
                    <Flag size={14} className="text-slate-400" />
                    <span><strong className="font-semibold text-slate-900 tabular-nums">{milestoneCount}</strong> milestone{milestoneCount !== 1 ? "s" : ""}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-600">
                    <CheckCircle size={14} className="text-slate-400" />
                    <span><strong className="font-semibold text-slate-900 tabular-nums">{totalTasks}</strong> task{totalTasks !== 1 ? "s" : ""}</span>
                  </span>
                  <div className="ml-auto">
                    {isAdmin && (
                      <Button
                        type="button"
                        variant="subtle"
                        size="sm"
                        onClick={e => { e.stopPropagation(); setCreateProjectFor(t); }}
                      >
                        <Sparkle size={14} />
                        Use template
                      </Button>
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
