import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useMeetingStore } from "../../store/meetingStore";
import Button from "../ui/Button";
import { toast } from "react-toastify";

// ── Config ───────────────────────────────────────────────────────────────────
const JOIN_OPEN_BEFORE_MIN = 10;   // Join unlocks this many minutes before start
const GRACE_AFTER_MIN = 15;        // ...and stays open this long after it ends
const PLACEHOLDER_HOST = "meet.eduflow.app"; // backend's placeholder link domain
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const STATUS_META = {
  SCHEDULED:   { label: "Scheduled",   cls: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  COMPLETED:   { label: "Completed",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED:   { label: "Cancelled",   cls: "bg-red-50 text-red-700 border-red-200" },
};

// ── Time helpers ─────────────────────────────────────────────────────────────
function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function hasRealLink(link) {
  return !!link && !link.includes(PLACEHOLDER_HOST);
}

function formatWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${time}`;
}

function untilText(ms) {
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 60) return `in ${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h < 24) return `in ${h}h${m ? ` ${m}m` : ""}`;
  const d = Math.floor(h / 24);
  return `in ${d} day${d > 1 ? "s" : ""}`;
}

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
function nowLocalInput() {
  const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

// ── Join Button (time-gated; host/admin can join anytime) ────────────────────
function JoinButton({ meeting, canJoinAnytime, size = "md" }) {
  const now = useNow();
  const start = new Date(meeting.scheduledAt).getTime();
  const end = start + (meeting.duration || 30) * 60000;
  const openAt = start - JOIN_OPEN_BEFORE_MIN * 60000;
  const closeAt = end + GRACE_AFTER_MIN * 60000;
  const realLink = hasRealLink(meeting.meetingLink);

  const cls = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const base = `${cls} font-semibold rounded-lg border-0 inline-flex items-center gap-1.5 shrink-0`;

  if (meeting.status === "CANCELLED")
    return <span className={`${base} bg-red-50 text-red-600`}>Cancelled</span>;
  if (!realLink)
    return <span className={`${base} bg-slate-100 text-slate-500`}>{canJoinAnytime ? "Add a link" : "No link yet"}</span>;
  if (meeting.status === "COMPLETED")
    return <span className={`${base} bg-slate-100 text-slate-500`}>Ended</span>;

  const joinable = canJoinAnytime || meeting.status === "IN_PROGRESS" || (now >= openAt && now <= closeAt);

  if (joinable) {
    return (
      <a
        href={meeting.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer no-underline`}
      >
        🎥 Join Meeting
      </a>
    );
  }
  if (now < openAt)
    return (
      <span className={`${base} bg-slate-100 text-slate-500`} title={`Opens ${JOIN_OPEN_BEFORE_MIN} min before start`}>
        🔒 Opens {untilText(openAt - now) === "in 0 min" ? "soon" : untilText(openAt - now)}
      </span>
    );
  return <span className={`${base} bg-slate-100 text-slate-500`}>Meeting ended</span>;
}

// ── Schedule / Edit Modal ────────────────────────────────────────────────────
function ScheduleMeetingModal({ role, currentUserId, existing, onClose, onSaved }) {
  const editing = !!existing;
  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [scheduledAt, setScheduledAt] = useState(existing ? toLocalInput(existing.scheduledAt) : "");
  const [duration, setDuration] = useState(existing?.duration || 30);
  const [type, setType] = useState(existing?.type || "VIDEO");
  const [meetingLink, setMeetingLink] = useState(hasRealLink(existing?.meetingLink) ? existing.meetingLink : "");
  const [projectId, setProjectId] = useState(existing?.projectId?._id || existing?.projectId || "");
  const [selected, setSelected] = useState(
    (existing?.participants || []).map((p) => p._id || p).filter((id) => id !== currentUserId)
  );
  const [people, setPeople] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const url = role === "ADMIN" ? "/users" : "/users/mentees";
        const [pplRes, projRes] = await Promise.all([
          api.get(url, { params: { limit: 100 } }),
          api.get("/projects", { params: { limit: 50 } }).catch(() => ({ data: { data: { projects: [] } } })),
        ]);
        setPeople((pplRes.data.data.users || []).filter((u) => u._id !== currentUserId));
        setProjects(projRes.data.data.projects || []);
      } catch (err) {
        console.error("Error loading form data:", err);
      }
    };
    load();
  }, [role, currentUserId]);

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const filtered = people.filter(
    (p) => p.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !scheduledAt) return;
    setSubmitting(true);
    setError(null);
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      scheduledAt: new Date(scheduledAt).toISOString(),
      duration: Number(duration),
      type,
      meetingLink: meetingLink.trim() || undefined,
      participants: selected,
      projectId: projectId || undefined,
    };
    try {
      if (editing) await api.patch(`/meetings/${existing._id}`, payload);
      else await api.post("/meetings", payload);
      toast.success(editing ? "Meeting updated." : "Meeting scheduled.");
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || (err.response?.data?.errors?.[0]?.msg) || "Failed to save meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="m-0 text-lg font-bold text-slate-900">{editing ? "Edit Meeting" : "Schedule Meeting"}</h2>
        </div>
        <form onSubmit={submit} className="p-6 flex flex-col gap-4">
          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">⚠️ {error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly Progress Review"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date &amp; Time *</label>
              <input required type="datetime-local" value={scheduledAt} min={editing ? undefined : nowLocalInput()}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 bg-white">
                  {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 bg-white">
                  <option value="VIDEO">🎥 Video</option>
                  <option value="AUDIO">🎙️ Audio</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Meeting Link</label>
              <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 no-underline">Get a Meet link ↗</a>
            </div>
            <input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="Paste a Google Meet / Zoom link"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            <p className="m-0 mt-1 text-[11px] text-slate-400">Attendees can join from 10 minutes before start. Leave blank only if you'll add it later.</p>
          </div>

          {projects.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project (optional)</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 bg-white">
                <option value="">— None —</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Participants ({selected.length} selected)
            </label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people..."
              className="w-full px-4 py-2.5 mb-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500" />
            <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto flex flex-col">
              {filtered.length === 0 ? (
                <span className="text-xs text-slate-400 italic p-3">No people found.</span>
              ) : (
                filtered.map((p) => (
                  <label key={p._id} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggle(p._id)}
                      className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-medium text-slate-800">{p.name}</span>
                    <span className="text-xs text-slate-400 ml-auto">{p.email}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description / Agenda</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              placeholder="Optional agenda..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting || !title.trim() || !scheduledAt}>
              {submitting ? "Saving..." : editing ? "Save Changes" : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function MeetingDetailModal({ meeting, canManage, onClose, onEdit, onStatus, onDelete }) {
  const st = STATUS_META[meeting.status] || STATUS_META.SCHEDULED;
  const host = meeting.hostId;
  const parts = meeting.participants || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="m-0 text-lg font-bold text-slate-900">{meeting.title}</h2>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${st.cls}`}>{st.label}</span>
            </div>
            <p className="m-0 mt-1 text-slate-500 text-sm">
              {meeting.type === "AUDIO" ? "🎙️ Audio" : "🎥 Video"} · {formatWhen(meeting.scheduledAt)} · {meeting.duration || 30} min
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer border-0 bg-transparent shrink-0">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <JoinButton meeting={meeting} canJoinAnytime={canManage} />
            {!hasRealLink(meeting.meetingLink) && canManage && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                ⚠️ No real link yet — click Edit to paste a Google Meet / Zoom link.
              </span>
            )}
          </div>

          {meeting.description && (
            <div>
              <h4 className="m-0 mb-1 text-xs font-bold text-slate-500 uppercase tracking-wide">Agenda</h4>
              <p className="m-0 text-sm text-slate-700 leading-relaxed">{meeting.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="m-0 mb-1 text-xs font-bold text-slate-500 uppercase tracking-wide">Host</h4>
              <p className="m-0 text-slate-700">{host?.name || "—"}</p>
            </div>
            {meeting.projectId?.title && (
              <div>
                <h4 className="m-0 mb-1 text-xs font-bold text-slate-500 uppercase tracking-wide">Project</h4>
                <p className="m-0 text-slate-700">{meeting.projectId.title}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="m-0 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wide">Participants ({parts.length})</h4>
            {parts.length === 0 ? (
              <p className="m-0 text-sm text-slate-400 italic">No participants added.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {parts.map((p) => (
                  <span key={p._id || p} className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                    {p.name || "User"}
                  </span>
                ))}
              </div>
            )}
          </div>

          {canManage && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={onEdit} className="text-xs px-3 py-1.5">✏️ Edit</Button>
              {meeting.status === "SCHEDULED" && (
                <Button variant="secondary" onClick={() => onStatus("IN_PROGRESS")} className="text-xs px-3 py-1.5">▶ Start</Button>
              )}
              {(meeting.status === "SCHEDULED" || meeting.status === "IN_PROGRESS") && (
                <>
                  <Button variant="secondary" onClick={() => onStatus("COMPLETED")} className="text-xs px-3 py-1.5">✓ Complete</Button>
                  <Button variant="danger" onClick={() => onStatus("CANCELLED")} className="text-xs px-3 py-1.5">Cancel Meeting</Button>
                </>
              )}
              <Button variant="danger" onClick={onDelete} className="text-xs px-3 py-1.5 ml-auto">Delete</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Meeting Card ─────────────────────────────────────────────────────────────
function MeetingCard({ meeting, currentUser, onOpen }) {
  const st = STATUS_META[meeting.status] || STATUS_META.SCHEDULED;
  const isHost = (meeting.hostId?._id || meeting.hostId) === currentUser?._id;
  const canManage = isHost || currentUser?.role === "ADMIN";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-lg shrink-0">
        {meeting.type === "AUDIO" ? "🎙️" : "🎥"}
      </div>
      <button onClick={onOpen} className="min-w-0 flex-1 text-left bg-transparent border-0 cursor-pointer p-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-900 truncate">{meeting.title}</span>
          <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${st.cls}`}>{st.label}</span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5 truncate">
          {formatWhen(meeting.scheduledAt)} · {meeting.duration || 30} min
          {meeting.hostId?.name && <> · Host: {meeting.hostId.name}</>}
          {(meeting.participants?.length || 0) > 0 && <> · {meeting.participants.length} invited</>}
        </div>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        <JoinButton meeting={meeting} canJoinAnytime={canManage} size="sm" />
        {canManage && (
          <button onClick={onOpen} className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer border-0">
            Manage
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Meetings Section ────────────────────────────────────────────────────
export default function MeetingsSection() {
  const { user } = useAuthStore();
  const { meetings, setMeetings } = useMeetingStore();

  const [tab, setTab] = useState("upcoming"); // upcoming | all
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [detailMeeting, setDetailMeeting] = useState(null);
  const detailIdRef = useRef(null);

  const canSchedule = user?.role === "ADMIN" || user?.role === "MENTOR";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (tab === "upcoming") {
        res = await api.get("/meetings/upcoming");
      } else {
        const params = { limit: 50 };
        if (statusFilter !== "ALL") params.status = statusFilter;
        res = await api.get("/meetings", { params });
      }
      const list = res.data.data.meetings || [];
      setMeetings(list);
      // keep an open detail modal in sync with fresh data
      if (detailIdRef.current) {
        const fresh = list.find((m) => m._id === detailIdRef.current);
        if (fresh) setDetailMeeting(fresh);
      }
    } catch (err) {
      console.error("Error loading meetings:", err);
      toast.error("Failed to load meetings.");
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter, setMeetings]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (m) => { detailIdRef.current = m._id; setDetailMeeting(m); };
  const closeDetail = () => { detailIdRef.current = null; setDetailMeeting(null); };

  const onSaved = () => {
    setScheduleOpen(false);
    setEditingMeeting(null);
    load();
  };

  const changeStatus = async (status) => {
    if (!detailMeeting) return;
    if (status === "CANCELLED" && !window.confirm("Cancel this meeting? Participants will be notified.")) return;
    try {
      await api.patch(`/meetings/${detailMeeting._id}/status`, { status });
      toast.success("Meeting updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  const deleteMeeting = async () => {
    if (!detailMeeting) return;
    if (!window.confirm("Delete this meeting permanently?")) return;
    try {
      await api.delete(`/meetings/${detailMeeting._id}`);
      toast.success("Meeting deleted.");
      closeDetail();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete meeting.");
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Meetings</h1>
          <p className="m-0 mt-1 text-slate-500 text-sm">Schedule and join video/audio meetings with a Google Meet or Zoom link.</p>
        </div>
        {canSchedule && (
          <Button onClick={() => { setEditingMeeting(null); setScheduleOpen(true); }}>+ Schedule Meeting</Button>
        )}
      </div>

      {/* Tabs + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {["upcoming", "all"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md cursor-pointer border-0 transition-colors ${
                tab === t ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}>
              {t === "upcoming" ? "Upcoming" : "All"}
            </button>
          ))}
        </div>
        {tab === "all" && (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 bg-white">
            <option value="ALL">All statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-sm">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-slate-500 text-sm m-0">
            {tab === "upcoming" ? "No upcoming meetings scheduled." : "No meetings found."}
          </p>
          {canSchedule && tab === "upcoming" && (
            <button onClick={() => setScheduleOpen(true)} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer bg-transparent border-0">
              Schedule your first meeting →
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {meetings.map((m) => (
            <MeetingCard key={m._id} meeting={m} currentUser={user} onOpen={() => openDetail(m)} />
          ))}
        </div>
      )}

      {/* Modals */}
      {(scheduleOpen || editingMeeting) && (
        <ScheduleMeetingModal
          role={user?.role}
          currentUserId={user?._id}
          existing={editingMeeting}
          onClose={() => { setScheduleOpen(false); setEditingMeeting(null); }}
          onSaved={onSaved}
        />
      )}

      {detailMeeting && (
        <MeetingDetailModal
          meeting={detailMeeting}
          canManage={(detailMeeting.hostId?._id || detailMeeting.hostId) === user?._id || user?.role === "ADMIN"}
          onClose={closeDetail}
          onEdit={() => { setEditingMeeting(detailMeeting); closeDetail(); }}
          onStatus={changeStatus}
          onDelete={deleteMeeting}
        />
      )}
    </div>
  );
}
