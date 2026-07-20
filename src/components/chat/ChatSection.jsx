import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { toast } from "react-toastify";

// ── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444"];
function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function ChatAvatar({ name, size = 38 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.36, lineHeight: 1 }}
    >
      {getInitials(name)}
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function formatRoomTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Room display name: for DIRECT, show the other participant; else the room name.
function roomTitle(room, currentUserId) {
  if (room.type === "DIRECT") {
    const other = (room.participants || []).find((p) => (p._id || p) !== currentUserId);
    return other?.name || "Direct message";
  }
  return room.name || (room.type === "PROJECT" ? room.projectId?.title || "Project chat" : "Group chat");
}

// ── New Chat Modal (ADMIN / MENTOR only) ─────────────────────────────────────
function NewChatModal({ role, currentUserId, onClose, onCreated }) {
  const [tab, setTab] = useState("direct"); // direct | group
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [search, setSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingPeople(true);
      try {
        // ADMIN can list everyone; MENTOR can list mentees.
        const url = role === "ADMIN" ? "/users" : "/users/mentees";
        const res = await api.get(url, { params: { limit: 100 } });
        setPeople((res.data.data.users || []).filter((u) => u._id !== currentUserId));
      } catch (err) {
        console.error("Error loading people:", err);
        toast.error("Failed to load people.");
      } finally {
        setLoadingPeople(false);
      }
    };
    load();
  }, [role, currentUserId]);

  const filtered = people.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const startDirect = async (participantId) => {
    setSubmitting(true);
    try {
      const res = await api.post("/chat/rooms/direct", { participantId });
      onCreated(res.data.data.room);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start chat.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const createGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selected.length === 0) return;
    setSubmitting(true);
    try {
      const res = await api.post("/chat/rooms", { type: "GROUP", name: groupName.trim(), participants: selected });
      onCreated(res.data.data.room);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200] p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-2xl animate-fade-in max-h-[85vh]">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="m-0 text-lg font-bold text-slate-900">New Conversation</h2>
          <div className="flex gap-2 mt-4">
            {["direct", "group"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border transition-colors ${
                  tab === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t === "direct" ? "Direct Message" : "Group"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {tab === "group" && (
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name *"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          )}

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {loadingPeople ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading people...</div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No people found.</div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p._id}
                  onClick={() => (tab === "direct" ? startDirect(p._id) : toggle(p._id))}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                    tab === "group" && selected.includes(p._id) ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50 border border-transparent"
                  } ${submitting ? "opacity-60 pointer-events-none" : ""}`}
                >
                  <ChatAvatar name={p.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900 truncate">{p.name}</div>
                    <div className="text-xs text-slate-500 truncate">{p.email}</div>
                  </div>
                  {tab === "group" && (
                    <input type="checkbox" readOnly checked={selected.includes(p._id)} className="w-4 h-4 accent-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer border-0"
          >
            Cancel
          </button>
          {tab === "group" && (
            <button
              onClick={createGroup}
              disabled={submitting || !groupName.trim() || selected.length === 0}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer border-0 disabled:opacity-50"
            >
              Create Group ({selected.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Single Message Bubble ─────────────────────────────────────────────────────
function MessageBubble({ message, mine, canDelete, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const senderName = message.senderId?.name || (mine ? "You" : "Unknown");

  const submitEdit = async () => {
    if (!draft.trim()) return;
    await onEdit(message._id, draft.trim());
    setEditing(false);
  };

  return (
    <div className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
      {!mine && <ChatAvatar name={senderName} size={30} />}
      <div className={`flex flex-col max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
        {!mine && <span className="text-[11px] font-semibold text-slate-500 mb-0.5 px-1">{senderName}</span>}
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words ${
            message.isDeleted
              ? "bg-slate-100 text-slate-400 italic"
              : mine
              ? "bg-blue-600 text-white"
              : "bg-white border border-slate-200 text-slate-800"
          }`}
        >
          {message.isDeleted ? (
            "This message was deleted"
          ) : editing ? (
            <div className="flex flex-col gap-2 min-w-[180px]">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full px-2 py-1 rounded-md border border-slate-300 text-sm text-slate-800 outline-none resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={submitEdit} className="px-2 py-1 text-xs font-semibold bg-white text-blue-600 rounded-md cursor-pointer border-0">Save</button>
                <button onClick={() => { setEditing(false); setDraft(message.content); }} className="px-2 py-1 text-xs font-semibold bg-white/20 text-white rounded-md cursor-pointer border-0">Cancel</button>
              </div>
            </div>
          ) : message.messageType === "IMAGE" && message.fileUrl ? (
            <img src={message.fileUrl} alt="attachment" className="max-w-[220px] rounded-lg" />
          ) : message.messageType === "FILE" && message.fileUrl ? (
            <a href={message.fileUrl} target="_blank" rel="noreferrer" className={`underline ${mine ? "text-white" : "text-blue-600"}`}>📎 Attachment</a>
          ) : (
            message.content
          )}
        </div>
        <div className={`flex items-center gap-2 mt-0.5 px-1 ${mine ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-slate-400">{formatTime(message.createdAt)}</span>
          {message.isEdited && !message.isDeleted && <span className="text-[10px] text-slate-400 italic">edited</span>}
          {!message.isDeleted && mine && !editing && (
            <button onClick={() => setEditing(true)} className="text-[10px] text-slate-400 hover:text-blue-600 cursor-pointer bg-transparent border-0 p-0">Edit</button>
          )}
          {!message.isDeleted && canDelete && !editing && (
            <button onClick={() => onDelete(message._id)} className="text-[10px] text-slate-400 hover:text-red-600 cursor-pointer bg-transparent border-0 p-0">Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Chat Section ─────────────────────────────────────────────────────────
export default function ChatSection() {
  const { user } = useAuthStore();
  const {
    rooms, activeRoomId, messagesByRoom, paginationByRoom,
    setRooms, setActiveRoom, setMessages, prependMessages, addMessage, updateMessage, removeMessage,
  } = useChatStore();

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [composer, setComposer] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const endRef = useRef(null);

  const canStartChat = user?.role === "ADMIN" || user?.role === "MENTOR";
  const messages = messagesByRoom[activeRoomId] || [];
  const pagination = paginationByRoom[activeRoomId];
  const activeRoom = rooms.find((r) => r._id === activeRoomId);

  // ── Load rooms ──────────────────────────────────────────────────────────
  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const res = await api.get("/chat/rooms");
      setRooms(res.data.data.rooms || []);
    } catch (err) {
      console.error("Error loading rooms:", err);
      toast.error("Failed to load conversations.");
    } finally {
      setLoadingRooms(false);
    }
  }, [setRooms]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // ── Open a room: load history (newest→ store ascending) + mark read ───────
  const openRoom = async (room) => {
    setActiveRoom(room._id);
    setLoadingMsgs(true);
    try {
      const res = await api.get(`/chat/rooms/${room._id}/messages`, { params: { limit: 50 } });
      const { messages: msgs, pagination: pg } = res.data.data;
      setMessages(room._id, [...(msgs || [])].reverse(), pg); // reverse newest-first → ascending
      api.patch(`/chat/rooms/${room._id}/read`).catch(() => {});
    } catch (err) {
      console.error("Error loading messages:", err);
      toast.error("Failed to load messages.");
    } finally {
      setLoadingMsgs(false);
    }
  };

  // ── Load older (pagination) ───────────────────────────────────────────────
  const loadOlder = async () => {
    if (!activeRoomId || !messages.length) return;
    setLoadingOlder(true);
    try {
      const res = await api.get(`/chat/rooms/${activeRoomId}/messages`, {
        params: { before: messages[0].createdAt, limit: 50 },
      });
      const { messages: older, pagination: pg } = res.data.data;
      prependMessages(activeRoomId, [...(older || [])].reverse(), pg);
    } catch (err) {
      console.error("Error loading older messages:", err);
    } finally {
      setLoadingOlder(false);
    }
  };

  // ── Auto-scroll to bottom on new messages ─────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeRoomId]);

  // ── Send (REST — Step 3 swaps to socket) ──────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!composer.trim() || !activeRoomId) return;
    setSending(true);
    try {
      const res = await api.post(`/chat/rooms/${activeRoomId}/messages`, { content: composer.trim() });
      addMessage(activeRoomId, res.data.data.message);
      setComposer("");
      loadRooms(); // refresh last-message preview + ordering
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async (id, content) => {
    try {
      const res = await api.patch(`/chat/messages/${id}`, { content });
      updateMessage(activeRoomId, res.data.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to edit message.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/chat/messages/${id}`);
      removeMessage(activeRoomId, id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message.");
    }
  };

  const onRoomCreated = (room) => {
    setNewChatOpen(false);
    loadRooms();
    if (room?._id) openRoom(room);
  };

  const isMine = (m) => (m.senderId?._id || m.senderId) === user?._id;

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="m-0 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
          <p className="m-0 mt-1 text-slate-500 text-sm">Direct and group conversations across your organization.</p>
        </div>
      </div>

      <div className="flex gap-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[72vh] min-h-[460px]">
        {/* ── Rooms list ── */}
        <div className={`${activeRoomId ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 lg:w-80 shrink-0 border-r border-slate-200`}>
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Conversations</span>
            {canStartChat && (
              <button
                onClick={() => setNewChatOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer border-0"
              >
                + New
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingRooms ? (
              <div className="py-10 text-center text-slate-400 text-sm">Loading...</div>
            ) : rooms.length === 0 ? (
              <div className="py-10 px-4 text-center text-slate-400 text-sm">
                No conversations yet.
                {!canStartChat && <div className="mt-1 text-xs">Your mentor or admin can start one with you.</div>}
              </div>
            ) : (
              rooms.map((room) => {
                const title = roomTitle(room, user?._id);
                const active = room._id === activeRoomId;
                return (
                  <button
                    key={room._id}
                    onClick={() => openRoom(room)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer border-0 border-b border-slate-100 transition-colors ${
                      active ? "bg-blue-50" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <ChatAvatar name={title} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">{title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{formatRoomTime(room.lastMessageAt)}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {room.type !== "DIRECT" && <span className="text-slate-400">{room.type === "PROJECT" ? "📁 " : "👥 "}</span>}
                        {room.lastMessage || "No messages yet"}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Thread ── */}
        <div className={`${activeRoomId ? "flex" : "hidden md:flex"} flex-col flex-1 min-w-0`}>
          {!activeRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
              <div className="text-4xl">💬</div>
              Select a conversation to start messaging
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                <button
                  onClick={() => setActiveRoom(null)}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer border-0 bg-transparent"
                >
                  ←
                </button>
                <ChatAvatar name={roomTitle(activeRoom, user?._id)} size={34} />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{roomTitle(activeRoom, user?._id)}</div>
                  <div className="text-[11px] text-slate-500">
                    {activeRoom.type === "DIRECT" ? "Direct message" : `${(activeRoom.participants || []).length} participants`}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50/50">
                {loadingMsgs ? (
                  <div className="py-10 text-center text-slate-400 text-sm">Loading messages...</div>
                ) : (
                  <>
                    {pagination?.hasMore && (
                      <div className="text-center">
                        <button
                          onClick={loadOlder}
                          disabled={loadingOlder}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 disabled:opacity-50"
                        >
                          {loadingOlder ? "Loading..." : "Load older messages"}
                        </button>
                      </div>
                    )}
                    {messages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No messages yet. Say hello 👋</div>
                    ) : (
                      messages.map((m) => (
                        <MessageBubble
                          key={m._id}
                          message={m}
                          mine={isMine(m)}
                          canDelete={isMine(m) || user?.role === "ADMIN"}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                    <div ref={endRef} />
                  </>
                )}
              </div>

              {/* Composer */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-end gap-2 bg-white">
                <textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none max-h-28"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !composer.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl cursor-pointer border-0 disabled:opacity-50 shrink-0"
                >
                  {sending ? "..." : "Send"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {newChatOpen && canStartChat && (
        <NewChatModal
          role={user?.role}
          currentUserId={user?._id}
          onClose={() => setNewChatOpen(false)}
          onCreated={onRoomCreated}
        />
      )}
    </div>
  );
}
