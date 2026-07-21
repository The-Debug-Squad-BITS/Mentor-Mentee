# EduFlow — Phase 3 Backend Integration Guide for Frontend AI

---

## 🤖 Instructions for AI Reading This File

You are an AI assistant helping a frontend team integrate **Phase 3** backend features into an existing React frontend that has already completed **Phase 1** (auth, dashboards, projects, tasks, submissions, notifications) and **Phase 2** (milestones, comments, templates, activity timeline, dashboard extensions) integration.

**Your job:**
- Read and understand the existing frontend architecture (Phase 1 + Phase 2) before making any changes.
- Reuse existing components, stores, and the `api.js` axios instance wherever possible — do NOT recreate them.
- If the required UI already exists (e.g. the notification bell, dashboards), update and integrate it with the new backend features.
- If the required UI does not exist (chat, meetings, calendar), create the missing screens/components following the existing project structure, design system, coding standards, and UI patterns.
- Maintain consistency with the current codebase. Avoid duplicate implementations. Refactor only when absolutely necessary for integration.

**Backend Base URL (REST):** `http://localhost:5000/api`
**Backend Socket URL (Socket.io):** `http://localhost:5000` ← the **server origin, NOT the `/api` path**. Default namespace, no custom namespace.

**Tech stack (same as Phase 1/2, plus one new dependency):**
- HTTP calls: `axios` (`src/lib/api.js` — already exists, reuse it)
- Global state: `zustand`
- Toasts: `react-toastify` (already used)
- **NEW — Real-time:** `socket.io-client` (install in Step 1)
- The UI framework (Tailwind) stays as-is — you only add logic

> **What's new in Phase 3:** Real-Time Chat, Video/Audio Meetings, and a unified Calendar — plus real-time push notifications over Socket.io. This is the first phase that uses **WebSockets**, so Step 1 (socket setup) is a prerequisite for the chat and notification steps.

---

## 🌿 Branching Strategy (IMPORTANT — Read Before Step 1)

Phase 3 uses a **staging branch** model, exactly like Phase 2. Do NOT merge any feature branch into `main` directly.

```
main
 └── phase3                  ← staging branch for all Phase 3 work
      ├── feat/socket-setup-integration
      ├── feat/chat-rest-integration
      ├── feat/realtime-chat-integration
      ├── feat/meetings-integration
      ├── feat/calendar-integration
      ├── feat/realtime-notifications-integration
      └── feat/dashboard-phase3-integration
```

**Rules:**
1. Every feature branch is created **from `phase3`**, not from `main`.
2. Every feature branch is merged back **into `phase3`** only, once its own step is complete and tested.
3. **Never** merge a feature branch into `main`.
4. **Never** merge `phase3` into `main` yourself — the human will do that manually once all Phase 3 features are integrated and tested end-to-end.

### One-Time Setup — Create the `phase3` Branch

Phase 3 builds on top of all Phase 1 + Phase 2 work. Base `phase3` on whichever branch currently contains the completed Phase 1 + Phase 2 frontend:

```bash
# If phase2 has ALREADY been merged into main:
git checkout main
git pull origin main
git checkout -b phase3
git push origin phase3

# If phase2 is NOT yet merged into main, base phase3 on phase2 instead:
# git checkout phase2
# git pull origin phase2
# git checkout -b phase3
# git push origin phase3
```

> 🛑 **STOP.** Confirm `phase3` branch exists locally and on remote, and that it contains the Phase 2 features, before proceeding to Step 1.

### Pattern for every step below

```bash
# Start each feature from the latest phase3
git checkout phase3
git pull origin phase3
git checkout -b feat/<feature-name>

# ...do the work...

git add .
git commit -m "feat: <description>"
git push origin feat/<feature-name>

# Merge back into phase3 (NOT main)
git checkout phase3
git pull origin phase3
git merge feat/<feature-name>
git push origin phase3
```

---
---

# STEP 1 — Socket.io Client Setup & Connection

## Branch
```bash
git checkout phase3 && git pull origin phase3
git checkout -b feat/socket-setup-integration
```

## Context
Phase 3 adds real-time features (chat + push notifications) over a single Socket.io connection that shares the backend's HTTP port. The socket authenticates with the **same JWT** used for REST. This step installs the client, creates a reusable socket singleton, connects it after login, and disconnects it on logout. Chat (Step 3) and real-time notifications (Step 7) depend on this.

## Install the dependency
```bash
npm install socket.io-client
```

## What this step needs to do
1. Add a `.env` entry for the socket origin (falls back to `http://localhost:5000`).
2. Create a single shared socket instance (`src/lib/socket.js`) that authenticates with the stored JWT.
3. Connect the socket right after a successful login (and on app load if a token already exists).
4. Disconnect and clear the socket on logout.

## Connection Contract (from backend `config/socket.js`)
- **URL:** the server origin `http://localhost:5000` (NOT `/api`). Default namespace.
- **Auth (preferred):** pass the JWT as `io(URL, { auth: { token } })`. (Query `?token=` or an `Authorization: Bearer` header also work, but use `auth.token`.)
- On a bad/missing token the server rejects the handshake with a `connect_error` whose message is one of: `Authentication error: No token provided`, `... User not found`, `... Account is deactivated`, `... Invalid or expired token`.
- On success the server attaches your user to the socket and immediately emits `notification_count` (see Step 7).

## `.env`
```
VITE_SOCKET_URL=http://localhost:5000
```

## Socket Singleton
```js
// src/lib/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

// Read the JWT the same way src/lib/api.js does, so REST and socket stay in sync.
function getToken() {
  return (
    localStorage.getItem('eduflow_token') ||
    JSON.parse(localStorage.getItem('eduflow_auth') || '{}')?.state?.token ||
    null
  );
}

export function connectSocket() {
  const token = getToken();
  if (!token) return null;
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },              // ← preferred handshake form
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
  });

  socket.on('connect_error', (err) => {
    // err.message will start with "Authentication error:" for bad tokens
    console.error('Socket connection error:', err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

## Integration Logic
```js
import { connectSocket, disconnectSocket } from '@/lib/socket';

// After a successful login (extend the existing login handler from Phase 1):
const onLoginSuccess = (user, token) => {
  // ...existing auth-store set + navigate...
  connectSocket();
};

// On app mount (e.g. in App.jsx), reconnect if a token already exists:
useEffect(() => {
  if (token) connectSocket();
  return () => { /* keep alive across route changes; only disconnect on logout */ };
}, [token]);

// On logout (extend the existing logout handler):
const handleLogout = () => {
  disconnectSocket();
  // ...existing logout() + navigate('/login')...
};
```

## Test
- [ ] After login, a WebSocket connection to `http://localhost:5000` is established (check Network → WS tab)
- [ ] The socket handshake carries the JWT (`auth.token`)
- [ ] Logging out closes the socket; logging back in reopens it
- [ ] A bad/expired token produces a `connect_error` and does not crash the app
- [ ] Reloading the page while logged in reconnects automatically

## Git Commit & Merge
```bash
git add .
git commit -m "feat: set up socket.io client with jwt auth, connect on login / disconnect on logout"
git push origin feat/socket-setup-integration

git checkout phase3 && git pull origin phase3
git merge feat/socket-setup-integration
git push origin phase3
```

> 🛑 **STOP.** Step 1 complete and merged into `phase3`. Confirm the socket connects/disconnects with the auth lifecycle. Tell me to proceed when ready.

---
---

# STEP 2 — Chat: Rooms & Messages (REST)

## Branch
```bash
git checkout phase3 && git pull origin phase3
git checkout -b feat/chat-rest-integration
```

## Context
Chat rooms are `DIRECT` (1:1), `GROUP`, or `PROJECT`. All chat routes require auth (`protect`); there is **no role gate** — access is enforced per-room (you must be a participant). This step wires the REST side: list rooms, open/create rooms, load message history (paginated), send/edit/delete messages, mark read. Step 3 layers real-time delivery on top.

## What this section needs to do
1. A Chat page/panel with a **rooms list** (left) and a **message thread** (right).
2. Start a **direct** chat with another user, or create a **group**/**project** room.
3. Load a room's message history with pagination ("load older").
4. Send a text message; edit/delete own messages; mark a room read on open.

## API Details

> All paths below are prefixed with the base URL `http://localhost:5000/api`. **Route-order note:** `/rooms/direct` is matched before `/rooms/:id`.

### Create / Get Direct Room
```
Method: POST
URL:    /chat/rooms/direct
Access: Any authenticated
Body:   { participantId: string }   // the other user's _id

Response (201 new, or 200 if it already exists):
{ "success": true, "message": "...", "data": { "room": {...} } }
```

### Create Group / Project Room
```
Method: POST
URL:    /chat/rooms
Access: Any authenticated
Body:   {
          type: "GROUP" | "PROJECT",     // "DIRECT" is rejected 400 — use /rooms/direct
          name?: string,
          participants?: string[],        // user IDs; the creator is auto-added
          projectId?: string              // REQUIRED when type === "PROJECT"
        }

Response (201): { "success": true, "message": "...", "data": { "room": {...} } }
```

### List My Rooms
```
Method: GET
URL:    /chat/rooms
Access: Any authenticated (returns only rooms where you are a participant)

Response (200): { "success": true, "data": { "rooms": [ {...} ] } }
// sorted by lastMessageAt desc, then updatedAt desc
```

### Get Room Detail
```
Method: GET
URL:    /chat/rooms/:id
Access: Participant only (403 otherwise)
Response (200): { "success": true, "data": { "room": {...} } }
```

### Update Room (rename / change participants)
```
Method: PATCH
URL:    /chat/rooms/:id
Access: Room creator or ADMIN
Body:   { name?: string, participants?: string[] }   // participants rejected for DIRECT rooms
Response (200): { "success": true, "message": "...", "data": { "room": {...} } }
```

### Delete Room (soft delete)
```
Method: DELETE
URL:    /chat/rooms/:id
Access: Room creator or ADMIN
Response (200): { "success": true, "message": "..." }
```

### Get Messages (paginated history)
```
Method: GET
URL:    /chat/rooms/:roomId/messages
Access: Participant only
Params: { before?: ISOdate,  page?: number=1,  limit?: number=50 }
        // `before` = load messages older than this timestamp (cursor)

Response (200):
{
  "success": true,
  "data": {
    "messages": [ {...} ],   // newest first
    "pagination": { "total", "page", "limit", "pages", "hasMore" }
  }
}
```

### Send Message
```
Method: POST
URL:    /chat/rooms/:roomId/messages
Access: Participant only
Body:   {
          content?: string,        // required for TEXT / SYSTEM
          messageType?: "TEXT" | "FILE" | "IMAGE" | "SYSTEM",   // default TEXT
          fileUrl?: string         // required for FILE / IMAGE (Cloudinary URL — see Phase 1 upload flow)
        }

Response (201): { "success": true, "message": "...", "data": { "message": {...} } }
```
> ⚠️ Sending via REST ALSO broadcasts a `new_message` socket event to the room (see Step 3). If you send over REST **and** also listen for `new_message`, de-duplicate by `message._id` so the sender doesn't see it twice.

### Edit Message
```
Method: PATCH
URL:    /chat/messages/:id
Access: Message sender only
Body:   { content: string }
Response (200): { "success": true, "message": "...", "data": { "message": { ..., "isEdited": true } } }
// also broadcasts `message_edited`
```

### Delete Message (soft delete)
```
Method: DELETE
URL:    /chat/messages/:id
Access: Message sender or ADMIN
Response (200): { "success": true, "message": "..." }
// clears content/fileUrl; also broadcasts `message_deleted`
```

## Object Shapes
```
room = {
  _id, name, type: "DIRECT"|"GROUP"|"PROJECT",
  participants: [ { _id, name, email, profileImage, role } ],
  projectId: { _id, title } | null,
  createdBy: { _id, name, email },
  lastMessage: string, lastMessageAt: date|null,
  isActive, createdAt, updatedAt
}

message = {
  _id, roomId,
  senderId: { _id, name, email, profileImage },
  content, messageType, fileUrl,
  isEdited, isDeleted, readBy: [userId...],
  createdAt, updatedAt
}
```

## Integration Logic
```js
import api from '@/lib/api';
import { useChatStore } from '@/store/chatStore';

// List my rooms
const loadRooms = async () => {
  const res = await api.get('/chat/rooms');
  setRooms(res.data.data.rooms);
};

// Start / open a direct chat
const openDirect = async (participantId) => {
  const res = await api.post('/chat/rooms/direct', { participantId });
  const room = res.data.data.room;
  await loadRooms();
  return room;
};

// Create a group room
const createGroup = async ({ name, participants }) => {
  const res = await api.post('/chat/rooms', { type: 'GROUP', name, participants });
  await loadRooms();
  return res.data.data.room;
};

// Load history (first page)
const loadMessages = async (roomId) => {
  const res = await api.get(`/chat/rooms/${roomId}/messages`, { params: { limit: 50 } });
  // reverse for chronological display if you render oldest→newest
  setMessages(res.data.data.messages, res.data.data.pagination);
};

// Load older (pagination cursor)
const loadOlder = async (roomId, oldestLoadedCreatedAt) => {
  const res = await api.get(`/chat/rooms/${roomId}/messages`, {
    params: { before: oldestLoadedCreatedAt, limit: 50 },
  });
  return res.data.data; // { messages, pagination }
};

// Send (REST fallback — Step 3 prefers the socket)
const sendMessageRest = async (roomId, content) => {
  const res = await api.post(`/chat/rooms/${roomId}/messages`, { content });
  return res.data.data.message;
};

// Mark room read when opened
const markRead = async (roomId) => {
  await api.patch(`/chat/rooms/${roomId}/read`);
};

// Edit / delete own message
const editMessage = async (id, content) => (await api.patch(`/chat/messages/${id}`, { content })).data.data.message;
const deleteMessage = async (id) => { await api.delete(`/chat/messages/${id}`); };
```

## Zustand Store
```js
// src/store/chatStore.js
import { create } from 'zustand';

export const useChatStore = create((set) => ({
  rooms: [],
  activeRoomId: null,
  messagesByRoom: {},           // { [roomId]: [message, ...] }
  paginationByRoom: {},         // { [roomId]: { total, page, pages, hasMore } }
  typingByRoom: {},             // { [roomId]: [ { userId, userName } ] }  ← filled in Step 3

  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (activeRoomId) => set({ activeRoomId }),
  setMessages: (roomId, messages, pagination) =>
    set((s) => ({
      messagesByRoom: { ...s.messagesByRoom, [roomId]: messages },
      paginationByRoom: { ...s.paginationByRoom, [roomId]: pagination },
    })),
  addMessage: (roomId, message) =>
    set((s) => {
      const list = s.messagesByRoom[roomId] || [];
      if (list.some((m) => m._id === message._id)) return s; // de-dupe (REST + socket)
      return { messagesByRoom: { ...s.messagesByRoom, [roomId]: [...list, message] } };
    }),
  updateMessage: (roomId, message) =>
    set((s) => ({
      messagesByRoom: {
        ...s.messagesByRoom,
        [roomId]: (s.messagesByRoom[roomId] || []).map((m) => (m._id === message._id ? message : m)),
      },
    })),
  removeMessage: (roomId, messageId) =>
    set((s) => ({
      messagesByRoom: {
        ...s.messagesByRoom,
        [roomId]: (s.messagesByRoom[roomId] || []).map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, content: '' } : m
        ),
      },
    })),
}));
```

## Chat Enums / Badge Hints
```
Room type:    DIRECT | GROUP | PROJECT
Message type: TEXT | FILE | IMAGE | SYSTEM
```

## Test
- [ ] Rooms list loads (only rooms I'm a participant of), sorted by most recent activity
- [ ] Starting a direct chat with an existing user returns the same room (no duplicates)
- [ ] Creating a group room with participants works; PROJECT room requires `projectId`
- [ ] Message history loads newest→oldest; "load older" via `before` cursor works and stops at `hasMore: false`
- [ ] Sending a message (REST) appends it once (no duplicate)
- [ ] Editing own message shows "edited"; deleting own message clears content
- [ ] Opening a room marks it read (`PATCH /rooms/:id/read`)
- [ ] Non-participant gets 403 on room detail/messages

## Git Commit & Merge
```bash
git add .
git commit -m "feat: integrate chat rooms and message history (rest)"
git push origin feat/chat-rest-integration

git checkout phase3 && git pull origin phase3
git merge feat/chat-rest-integration
git push origin phase3
```

> 🛑 **STOP.** Step 2 complete and merged into `phase3`. Test rooms + message history. Tell me to proceed when ready.

---
---

# STEP 3 — Chat: Real-Time Events (Socket.io)

## Branch
```bash
git checkout phase3 && git pull origin phase3
git checkout -b feat/realtime-chat-integration
```

## Context
This step makes chat live: join the active room, send messages over the socket, receive new/edited/deleted messages instantly, and show typing indicators. Uses the socket singleton from Step 1 and the `chatStore` from Step 2.

## Socket Event Contract (from backend `socket/chatHandler.js`)

> ⚠️ **Payload shape gotcha:** `join_room` and `leave_room` take a **bare `roomId` string**. `send_message`, `typing`, and `stop_typing` take an **object**.

### CLIENT → SERVER
| Event | Payload | Notes |
|---|---|---|
| `join_room` | `roomId` *(bare string)* | Joins the socket room + marks its messages read; server replies `joined_room` |
| `leave_room` | `roomId` *(bare string)* | Leaves the socket room |
| `send_message` | `{ roomId, content, messageType?, fileUrl? }` | Persists + broadcasts `new_message` to the room |
| `typing` | `{ roomId }` | Broadcasts `user_typing` to others in the room |
| `stop_typing` | `{ roomId }` | Broadcasts `user_stop_typing` to others in the room |

### SERVER → CLIENT
| Event | Payload | Notes |
|---|---|---|
| `joined_room` | `{ roomId }` | Ack for `join_room` |
| `new_message` | `{ message }` | Populated message. Fires for socket AND REST sends → de-dupe by `_id` |
| `message_edited` | `{ messageId, content, message }` | From REST edit |
| `message_deleted` | `{ messageId, roomId }` | From REST delete |
| `user_typing` | `{ roomId, userId, userName }` | Someone (not you) is typing |
| `user_stop_typing` | `{ roomId, userId }` | They stopped |
| `chat_error` | `{ message }` | join/send failure |

## Integration Logic
```js
import { getSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';

// Register listeners ONCE (e.g. in the Chat page mount, or a ChatProvider)
export function registerChatListeners() {
  const socket = getSocket();
  if (!socket) return;
  const { addMessage, updateMessage, removeMessage } = useChatStore.getState();

  socket.on('new_message', ({ message }) => addMessage(message.roomId, message));
  socket.on('message_edited', ({ message }) => updateMessage(message.roomId, message));
  socket.on('message_deleted', ({ messageId, roomId }) => removeMessage(roomId, messageId));

  socket.on('user_typing', ({ roomId, userId, userName }) => {
    useChatStore.setState((s) => ({
      typingByRoom: {
        ...s.typingByRoom,
        [roomId]: [...(s.typingByRoom[roomId] || []).filter((u) => u.userId !== userId), { userId, userName }],
      },
    }));
  });
  socket.on('user_stop_typing', ({ roomId, userId }) => {
    useChatStore.setState((s) => ({
      typingByRoom: {
        ...s.typingByRoom,
        [roomId]: (s.typingByRoom[roomId] || []).filter((u) => u.userId !== userId),
      },
    }));
  });

  socket.on('chat_error', ({ message }) => console.error('chat_error:', message));
}

// Clean up when leaving the chat page
export function unregisterChatListeners() {
  const socket = getSocket();
  if (!socket) return;
  ['new_message', 'message_edited', 'message_deleted', 'user_typing', 'user_stop_typing', 'chat_error']
    .forEach((e) => socket.off(e));
}

// Join / leave the active room (roomId is a BARE string here)
export const joinRoom = (roomId) => getSocket()?.emit('join_room', roomId);
export const leaveRoom = (roomId) => getSocket()?.emit('leave_room', roomId);

// Send over the socket (preferred over REST for live UX)
export const sendMessage = (roomId, content) =>
  getSocket()?.emit('send_message', { roomId, content, messageType: 'TEXT' });

// Typing indicator (debounce stop_typing ~1.5s after last keystroke)
export const emitTyping = (roomId) => getSocket()?.emit('typing', { roomId });
export const emitStopTyping = (roomId) => getSocket()?.emit('stop_typing', { roomId });
```

```js
// In the Chat component:
useEffect(() => {
  registerChatListeners();
  return () => unregisterChatListeners();
}, []);

useEffect(() => {
  if (!activeRoomId) return;
  joinRoom(activeRoomId);              // bare string
  return () => leaveRoom(activeRoomId);
}, [activeRoomId]);
```

## Test
- [ ] Open the same room in two browsers → a message sent in one appears instantly in the other
- [ ] The sender does NOT see a duplicate (REST + `new_message` de-duped by `_id`)
- [ ] Typing in one window shows "X is typing…" in the other; it clears on stop/idle
- [ ] Editing/deleting a message updates both windows live
- [ ] Joining a room clears its unread state (server marks read on `join_room`)
- [ ] `chat_error` (e.g. non-participant) is handled gracefully

## Git Commit & Merge
```bash
git add .
git commit -m "feat: integrate real-time chat (send, receive, typing, edit/delete) over socket.io"
git push origin feat/realtime-chat-integration

git checkout phase3 && git pull origin phase3
git merge feat/realtime-chat-integration
git push origin phase3
```

> 🛑 **STOP.** Step 3 complete and merged into `phase3`. Test live chat across two sessions. Tell me to proceed when ready.

---
---

# STEP 4 — Meetings Integration

## Branch
```bash
git checkout phase3 && git pull origin phase3
git checkout -b feat/meetings-integration
```

## Context
Meetings are scheduled video/audio calls. EduFlow does **not** host calls — it manages a `meetingLink` (provided, or auto-generated as `https://meet.eduflow.app/<rand>`). Only **ADMIN/MENTOR** can create; everyone can view meetings they host or are invited to. Creating a meeting also notifies participants and auto-creates calendar events (Step 5).

## What this section needs to do
1. A Meetings page listing the user's meetings (filterable by status/project/date) + an "Upcoming" view.
2. Schedule Meeting form (ADMIN/MENTOR only): title, description, date/time, duration, type, participants, optional link.
3. Meeting detail view with join link, participants, status.
4. Host/ADMIN can update, change status, or cancel (delete).

## API Details

> Base `http://localhost:5000/api`. **Route-order note:** `/meetings/upcoming` is matched before `/meetings/:id`, and `/meetings/:id/status` before `/meetings/:id`.

### Upcoming Meetings
```
Method: GET
URL:    /meetings/upcoming
Access: Authenticated (non-admin: only own host/participant; ADMIN: all in org)
Response (200): { "success": true, "data": { "meetings": [ {...} ] } }
// status=SCHEDULED, scheduledAt > now, ascending, up to 20
```

### List Meetings
```
Method: GET
URL:    /meetings
Access: Authenticated (non-admin filtered to host/participant; ADMIN all in org)
Params: { status?, projectId?, startDate?, endDate?, page?=1, limit?=20 }
Response (200): { "success": true, "data": { "meetings": [ {...} ], "pagination": { total, page, limit, pages } } }
```

### Meeting Detail
```
Method: GET
URL:    /meetings/:id
Access: Host, participant, or ADMIN (403 otherwise)
Response (200): { "success": true, "data": { "meeting": {...} } }
```

### Create Meeting
```
Method: POST
URL:    /meetings
Access: ADMIN, MENTOR
Body:   {
          title: string,                 // required
          scheduledAt: string,           // required, ISO8601
          description?: string,
          projectId?: string,
          participants?: string[],
          duration?: number,             // minutes, default 30
          type?: "VIDEO" | "AUDIO",      // default VIDEO
          meetingLink?: string           // blank → backend generates one
        }
Response (201): { "success": true, "message": "...", "data": { "meeting": {...} } }
// side effects: notifies participants (MEETING_SCHEDULED) + creates MEETING calendar events
```

### Update Meeting Status
```
Method: PATCH
URL:    /meetings/:id/status
Access: Host or ADMIN
Body:   { status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }
Response (200): { "success": true, "message": "...", "data": { "meeting": {...} } }
// status=CANCELLED notifies participants (MEETING_CANCELLED)
```

### Update Meeting
```
Method: PATCH
URL:    /meetings/:id
Access: Host or ADMIN
Body:   { title?, description?, scheduledAt?, duration?, type?, meetingLink?, notes?, participants?, projectId? }
Response (200): { "success": true, "message": "...", "data": { "meeting": {...} } }
```

### Delete Meeting (soft delete)
```
Method: DELETE
URL:    /meetings/:id
Access: Host or ADMIN
Response (200): { "success": true, "message": "..." }
```

## Object Shape
```
meeting = {
  _id, title, description,
  hostId: { _id, name, email, profileImage },
  participants: [ { _id, name, email, profileImage, role } ],
  projectId: { _id, title } | null,
  scheduledAt, duration, status, type, meetingLink, notes,
  isActive, createdAt, updatedAt
}
```

## Integration Logic
```js
import api from '@/lib/api';
import { useMeetingStore } from '@/store/meetingStore';

const loadMeetings = async (filters = {}) => {
  const res = await api.get('/meetings', { params: { limit: 20, ...filters } });
  setMeetings(res.data.data.meetings, res.data.data.pagination);
};

const loadUpcoming = async () => {
  const res = await api.get('/meetings/upcoming');
  return res.data.data.meetings;
};

// ADMIN / MENTOR only — gate the "Schedule" button by user.role
const createMeeting = async (payload) => {
  const res = await api.post('/meetings', payload); // { title, scheduledAt, participants, duration, type, ... }
  await loadMeetings();
  return res.data.data.meeting;
};

const changeStatus = async (id, status) => {
  await api.patch(`/meetings/${id}/status`, { status });
  await loadMeetings();
};

const cancelMeeting = async (id) => {
  const ok = window.confirm('Cancel this meeting? Participants will be notified.');
  if (!ok) return;
  await api.patch(`/meetings/${id}/status`, { status: 'CANCELLED' });
  await loadMeetings();
};
```

## Zustand Store
```js
// src/store/meetingStore.js
import { create } from 'zustand';

export const useMeetingStore = create((set) => ({
  meetings: [],
  pagination: null,
  currentMeeting: null,
  setMeetings: (meetings, pagination) => set({ meetings, pagination }),
  setCurrentMeeting: (currentMeeting) => set({ currentMeeting }),
}));
```

## Status / Type Badge Hints
```
Status: SCHEDULED → blue | IN_PROGRESS → amber | COMPLETED → green | CANCELLED → red
Type:   VIDEO 🎥 | AUDIO 🎙️
```

## Test
- [ ] Meetings list + Upcoming load; non-admins see only their own meetings
- [ ] Schedule Meeting (ADMIN/MENTOR) works; MENTEE cannot see/submit the form (403 if forced)
- [ ] Leaving `meetingLink` blank still yields a joinable link (backend-generated)
- [ ] Participants receive a `MEETING_SCHEDULED` notification (verify in Step 7 bell)
- [ ] Host/ADMIN can change status; CANCELLED notifies participants
- [ ] A new meeting appears on the Calendar (Step 5) for host + participants

## Git Commit & Merge
```bash
git add .
git commit -m "feat: integrate meetings - schedule, list, upcoming, status, cancel"
git push origin feat/meetings-integration

git checkout phase3 && git pull origin phase3
git merge feat/meetings-integration
git push origin phase3
```

> 🛑 **STOP.** Step 4 complete and merged into `phase3`. Test meeting scheduling + notifications. Tell me to proceed when ready.

---
---

# STEP 5 — Calendar Integration

## Branch
```bash
git checkout phase3 && git pull origin phase3
git checkout -b feat/calendar-integration
```

## Context
A unified calendar shows the user's own events: auto-generated **task deadlines**, **milestone deadlines**, and **meetings**, plus **custom** events the user creates. Users can only create `CUSTOM` events (auto types are generated by the backend). Every GET returns only the authenticated user's events.

## What this section needs to do
1. A Calendar page with a month grid (`/calendar/month/:year/:month`) and prev/next navigation.
2. Color-coded events by `eventType`.
3. Create/edit/delete **custom** events (create dialog → title, start, optional end, all-day, color).
4. Optionally an agenda/list view using `GET /calendar` with `eventType`/date filters.

## API Details

> Base `http://localhost:5000/api`. **Route-order note:** `/calendar/month/:year/:month` is matched before `/calendar/:id`.

### Events by Month
```
Method: GET
URL:    /calendar/month/:year/:month     // month is 1–12
Access: Own events
Response (200): { "success": true, "data": { "year": 2026, "month": 7, "events": [ {...} ] } }
```

### List Events (filterable)
```
Method: GET
URL:    /calendar
Access: Own events
Params: { eventType?, startDate?, endDate? }
Response (200): { "success": true, "data": { "events": [ {...} ] } }  // sorted by startDate asc
```

### Event Detail
```
Method: GET
URL:    /calendar/:id
Access: Owner only (403 otherwise)
Response (200): { "success": true, "data": { "event": {...} } }
```

### Create Custom Event
```
Method: POST
URL:    /calendar
Access: Any authenticated
Body:   {
          title: string,          // required
          startDate: string,      // required, ISO8601
          description?: string,
          endDate?: string,       // ISO8601
          isAllDay?: boolean,
          color?: string          // hex, default "#4A90D9"
        }
Response (201): { "success": true, "message": "...", "data": { "event": {...} } }
// always created with eventType "CUSTOM"
```

### Update Custom Event
```
Method: PATCH
URL:    /calendar/:id
Access: Owner only
Body:   { title?, description?, startDate?, endDate?, isAllDay?, color? }
Response (200): { "success": true, "message": "...", "data": { "event": {...} } }
```

### Delete Event (soft delete)
```
Method: DELETE
URL:    /calendar/:id
Access: Owner (or ADMIN in same org)
Response (200): { "success": true, "message": "..." }
```

## Object Shape & Event Types
```
event = {
  _id, title, description,
  userId, organizationId,
  eventType: "TASK_DEADLINE" | "MILESTONE_DEADLINE" | "MEETING" | "CUSTOM",
  entityId,               // ref to the Task/Milestone/Meeting (null for CUSTOM)
  startDate, endDate, isAllDay, color,
  isActive, createdAt, updatedAt
}
```

Auto-generated event colors (from backend `calendarSync.js`), match these so types read consistently:
```
TASK_DEADLINE       → #E67E22  (orange)   title: "Task Due: <title>"        (all-day)
MILESTONE_DEADLINE  → #8E44AD  (purple)   title: "Milestone Due: <title>"   (all-day)
MEETING             → #27AE60  (green)    title: "Meeting: <title>"
CUSTOM              → #4A90D9  (blue, default; user-chosen)
```

## Integration Logic
```js
import api from '@/lib/api';
import { useCalendarStore } from '@/store/calendarStore';

const loadMonth = async (year, month) => {   // month 1–12
  const res = await api.get(`/calendar/month/${year}/${month}`);
  setEvents(res.data.data.events);
};

const createEvent = async ({ title, startDate, endDate, isAllDay, color, description }) => {
  const res = await api.post('/calendar', { title, startDate, endDate, isAllDay, color, description });
  return res.data.data.event; // eventType will be "CUSTOM"
};

const updateEvent = async (id, patch) => (await api.patch(`/calendar/${id}`, patch)).data.data.event;

const deleteEvent = async (id) => {
  const ok = window.confirm('Delete this event?');
  if (!ok) return;
  await api.delete(`/calendar/${id}`);
};
```

## Zustand Store
```js
// src/store/calendarStore.js
import { create } from 'zustand';

export const useCalendarStore = create((set) => ({
  events: [],
  view: { year: null, month: null },
  setEvents: (events) => set({ events }),
  setView: (year, month) => set({ view: { year, month } }),
}));
```

## Test
- [ ] Month grid loads the correct events for `:year/:month`; prev/next re-fetches
- [ ] Auto-generated events appear: create a task/milestone with a due date, schedule a meeting → they show up (correct color/type)
- [ ] Create a custom event → appears with `eventType: "CUSTOM"`
- [ ] Edit/delete a custom event → updates/removes correctly
- [ ] Only the current user's events are visible; opening someone else's event id → 403

## Git Commit & Merge
```bash
git add .
git commit -m "feat: integrate unified calendar - month view, custom events, auto-generated deadlines/meetings"
git push origin feat/calendar-integration

git checkout phase3 && git pull origin phase3
git merge feat/calendar-integration
git push origin phase3
```

> 🛑 **STOP.** Step 5 complete and merged into `phase3`. Test the calendar + auto-generated events. Tell me to proceed when ready.

---
---

# STEP 6 — Real-Time Notifications

## Branch
```bash
git checkout phase3 && git pull origin phase3
git checkout -b feat/realtime-notifications-integration
```

## Context
Phase 1 already has a notification bell backed by REST. Phase 3 makes it **live**: on socket connect the server sends your unread count, and pushes `new_notification` + updated `notification_count` in real time (e.g. when you get a chat message while offline-in-that-room, or a meeting is scheduled/cancelled). **Extend the existing `NotificationBell` and `notificationStore`** — do not rebuild them.

## API + Socket Contract

### REST (existing, keep using)
```
GET   /notifications              → { success, message, data: { notifications } }   // all, newest first
PATCH /notifications/:id/read     → { success, message, data: { notification } }    // mark one read
```
> ⚠️ There is **no REST "mark all read"** endpoint — mark-all is **socket-only** (`mark_all_read`).

### Socket (from backend `socket/notificationHandler.js`)
On connect, the server immediately emits `notification_count`.

**CLIENT → SERVER**
| Event | Payload | Effect |
|---|---|---|
| `mark_notification_read` | `{ notificationId }` | Marks one read, re-emits `notification_count` |
| `mark_all_read` | *(none)* | Marks all your unread read, re-emits `notification_count` |

**SERVER → CLIENT**
| Event | Payload | Effect |
|---|---|---|
| `notification_count` | `{ unreadCount }` | Update the bell badge |
| `new_notification` | `{ notification }` | Prepend to the list, bump the badge, optional toast |

### Notification object & types
```
notification = { _id, userId, title, message, type, isRead, createdAt, updatedAt }

type ∈ TASK_ASSIGNED | SUBMISSION_RECEIVED | SUBMISSION_APPROVED | REVISION_REQUESTED |
       INVITATION_SENT | NEW_MESSAGE | MEETING_SCHEDULED | MEETING_CANCELLED | SYSTEM_ALERT
```

## Integration Logic
```js
import { getSocket } from '@/lib/socket';
import api from '@/lib/api';
import { useNotificationStore } from '@/store/notificationStore';
import { toast } from 'react-toastify';

// Register once after the socket connects (e.g. in App.jsx or a NotificationProvider)
export function registerNotificationListeners() {
  const socket = getSocket();
  if (!socket) return;
  const { setUnreadCount, prependNotification } = useNotificationStore.getState();

  socket.on('notification_count', ({ unreadCount }) => setUnreadCount(unreadCount));
  socket.on('new_notification', ({ notification }) => {
    prependNotification(notification);
    toast.info(notification.title);   // optional
  });
}

// Initial history still comes from REST
const loadNotifications = async () => {
  const res = await api.get('/notifications');
  setNotifications(res.data.data.notifications);
};

// Mark one read — prefer socket (keeps count in sync server-side), REST also works
const markRead = (notificationId) => {
  getSocket()?.emit('mark_notification_read', { notificationId });
  // or: await api.patch(`/notifications/${notificationId}/read`);
};

// Mark all read — socket ONLY
const markAllRead = () => getSocket()?.emit('mark_all_read');
```

## Store Changes
```js
// Extend existing src/store/notificationStore.js — add unreadCount + real-time helpers
// (illustrative; keep existing fields/setters)
import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  prependNotification: (n) =>
    set((s) => ({ notifications: [n, ...s.notifications], unreadCount: s.unreadCount + 1 })),
}));
```

## Test
- [ ] On login/connect, the bell badge shows the correct unread count (from `notification_count`)
- [ ] Trigger a notification (get a chat message while not in that room, or have a meeting scheduled) → `new_notification` arrives live, badge increments, toast shows
- [ ] Marking one read via socket updates the badge everywhere (count re-emitted)
- [ ] "Mark all read" (socket) clears the badge
- [ ] Existing REST history load still works (Phase 1 behavior intact)

## Git Commit & Merge
```bash
git add .
git commit -m "feat: integrate real-time notifications (live count + push) over socket.io"
git push origin feat/realtime-notifications-integration

git checkout phase3 && git pull origin phase3
git merge feat/realtime-notifications-integration
git push origin phase3
```

> 🛑 **STOP.** Step 6 complete and merged into `phase3`. Test live notifications. Tell me to proceed when ready.

---
---

# STEP 7 — Dashboard Phase 3 Enhancements

## Branch
```bash
git checkout phase3 && git pull origin phase3
git checkout -b feat/dashboard-phase3-integration
```

## Context
The three existing dashboards get new Phase 3 fields in their **existing** response payloads. **No new endpoints** — just read the extra fields and add widgets. The dashboards already return Phase 1 + Phase 2 fields; these are additive.

## What this section needs to do
1. Admin Dashboard: "Upcoming Meetings" widget + an "Active Chat Rooms" stat card.
2. Mentor Dashboard: "Upcoming Meetings" widget + an "Unread Messages" stat card.
3. Mentee Dashboard: "Upcoming Meetings" widget + an "Upcoming Deadlines" widget (from calendar).

## API Details

### Admin Dashboard — new fields (`GET /dashboard/admin`)
```
New fields in data:
  upcomingMeetings   Array   // up to 5, org-wide, SCHEDULED & future; each populated hostId {name,email} + participants {name,email}
  activeChatRooms    Number  // count of active chat rooms in the org
```

### Mentor Dashboard — new fields (`GET /dashboard/mentor`)
```
New fields in data:
  upcomingMeetings   Array   // up to 5 where mentor is host or participant; populated hostId + participants {name,email}
  unreadMessages     Number  // unread chat messages across the mentor's rooms
```

### Mentee Dashboard — new fields (`GET /dashboard/mentee`)
```
New fields in data:
  upcomingMeetings   Array   // up to 5 where mentee is host or participant; populated hostId {name,email} ONLY (participants NOT populated)
  upcomingDeadlines  Array   // up to 5 CalendarEvents (TASK_DEADLINE / MILESTONE_DEADLINE), future, sorted asc
```

## Integration Logic
```js
// Extend the existing dashboard fetches — do NOT add new useEffects/endpoints.

// Admin
const data = (await api.get('/dashboard/admin')).data.data;
// NEW: data.upcomingMeetings → list widget (title, scheduledAt, hostId.name)
//      data.activeChatRooms  → stat card
setAdminStats(data);

// Mentor
const mData = (await api.get('/dashboard/mentor')).data.data;
// NEW: mData.upcomingMeetings → list widget
//      mData.unreadMessages   → stat card (link to Chat)
setMentorStats(mData);

// Mentee
const meData = (await api.get('/dashboard/mentee')).data.data;
// NEW: meData.upcomingMeetings  → list widget
//      meData.upcomingDeadlines → list widget (title, startDate, eventType color)
setMenteeStats(meData);
```

## Store Changes
```js
// Extend existing src/store/dashboardStore.js — no new store needed.
// setAdminStats / setMentorStats / setMenteeStats already accept the full data
// object, so the new fields flow through automatically.
```

## Test
- [ ] Admin dashboard shows Upcoming Meetings + Active Chat Rooms count
- [ ] Mentor dashboard shows Upcoming Meetings + Unread Messages count (matches Chat)
- [ ] Mentee dashboard shows Upcoming Meetings + Upcoming Deadlines (from calendar)
- [ ] Mentee `upcomingMeetings` renders even though `participants` aren't populated (use `hostId` + count)
- [ ] No regressions on existing Phase 1 / Phase 2 dashboard widgets

## Git Commit & Merge
```bash
git add .
git commit -m "feat: extend dashboards with phase 3 data (meetings, chat, deadlines)"
git push origin feat/dashboard-phase3-integration

git checkout phase3 && git pull origin phase3
git merge feat/dashboard-phase3-integration
git push origin phase3
```

> 🛑 **STOP.** Step 7 complete and merged into `phase3`. All Phase 3 features are now integrated into the `phase3` branch. Do NOT merge `phase3` into `main` — the human will do this manually after full end-to-end testing.

---
---

# 📋 Complete Phase 3 Step Summary

| Step | Feature | Branch | Merges Into |
|---|---|---|---|
| Setup | Create `phase3` staging branch (from `main`, or `phase2` if not yet merged) | `phase3` | `main` (branch only) |
| **Step 1** | Socket.io client setup + JWT auth lifecycle | `feat/socket-setup-integration` | `phase3` |
| **Step 2** | Chat — rooms & message history (REST) | `feat/chat-rest-integration` | `phase3` |
| **Step 3** | Chat — real-time events (sockets) | `feat/realtime-chat-integration` | `phase3` |
| **Step 4** | Meetings — schedule/list/status/cancel | `feat/meetings-integration` | `phase3` |
| **Step 5** | Calendar — month view + custom/auto events | `feat/calendar-integration` | `phase3` |
| **Step 6** | Real-time notifications (live bell) | `feat/realtime-notifications-integration` | `phase3` |
| **Step 7** | Dashboard Phase 3 enhancements (all 3 roles) | `feat/dashboard-phase3-integration` | `phase3` |

**Reminder:** All feature branches merge into `phase3` only. `phase3 → main` is a manual, human-triggered merge after full testing.

---

# ⚙️ Zustand Stores Reference (Phase 3)

| Store File | Purpose | Key State |
|---|---|---|
| `chatStore.js` *(new)* | Rooms, messages per room, typing | `rooms`, `activeRoomId`, `messagesByRoom`, `paginationByRoom`, `typingByRoom` |
| `meetingStore.js` *(new)* | Meetings list + detail | `meetings`, `pagination`, `currentMeeting` |
| `calendarStore.js` *(new)* | Calendar events + current month | `events`, `view` |
| `notificationStore.js` *(existing, extended)* | Notifications + live count | `notifications`, `unreadCount` |
| `dashboardStore.js` *(existing, extended)* | Dashboard stats | `adminStats`, `mentorStats`, `menteeStats` — now include Phase 3 fields |
| `src/lib/socket.js` *(new, not a store)* | Shared Socket.io singleton | `connectSocket()`, `getSocket()`, `disconnectSocket()` |

---

# ⚠️ Error & Socket Handling Reference

### REST errors (unchanged from Phase 1/2)
```js
catch (error) {
  const status = error.response?.status;
  const data   = error.response?.data;
  if (status === 400 && data?.errors) { /* field errors: [{ field, message }] */ }
  else if (status === 401) { /* axios interceptor → redirect to /login */ }
  else if (status === 403) { /* "You don't have permission for this action" */ }
  else if (status === 404) { /* "Not found" */ }
  else { /* data?.message || "Something went wrong. Please try again." */ }
}
```

### Socket errors
```js
socket.on('connect_error', (err) => {
  // err.message starts with "Authentication error:" for bad/expired tokens
  // → force a re-login if the JWT is invalid
});
socket.on('chat_error', ({ message }) => { /* show a non-blocking toast */ });
```

---

# 🔌 Socket Event Quick Reference

**Connect:** `io('http://localhost:5000', { auth: { token } })` — default namespace, JWT required.

| Direction | Event | Payload |
|---|---|---|
| C→S | `join_room` | `roomId` *(bare string)* |
| C→S | `leave_room` | `roomId` *(bare string)* |
| C→S | `send_message` | `{ roomId, content, messageType?, fileUrl? }` |
| C→S | `typing` / `stop_typing` | `{ roomId }` |
| C→S | `mark_notification_read` | `{ notificationId }` |
| C→S | `mark_all_read` | *(none)* |
| S→C | `joined_room` | `{ roomId }` |
| S→C | `new_message` | `{ message }` *(also fires on REST send — de-dupe by `_id`)* |
| S→C | `message_edited` | `{ messageId, content, message }` |
| S→C | `message_deleted` | `{ messageId, roomId }` |
| S→C | `user_typing` | `{ roomId, userId, userName }` |
| S→C | `user_stop_typing` | `{ roomId, userId }` |
| S→C | `chat_error` | `{ message }` |
| S→C | `notification_count` | `{ unreadCount }` |
| S→C | `new_notification` | `{ notification }` |

---

# 🔗 Phase 3 REST API Quick Reference

| Method | URL | Who Can Call | What It Does |
|---|---|---|---|
| POST | `/chat/rooms/direct` | Any auth | Get/create a 1:1 room |
| POST | `/chat/rooms` | Any auth | Create GROUP/PROJECT room |
| GET | `/chat/rooms` | Any auth | List my rooms |
| GET | `/chat/rooms/:id` | Participant | Room detail |
| PATCH | `/chat/rooms/:id` | Creator/ADMIN | Rename / edit participants |
| DELETE | `/chat/rooms/:id` | Creator/ADMIN | Soft-delete room |
| GET | `/chat/rooms/:roomId/messages` | Participant | Message history (paginated) |
| POST | `/chat/rooms/:roomId/messages` | Participant | Send message |
| PATCH | `/chat/rooms/:roomId/read` | Participant | Mark room read |
| PATCH | `/chat/messages/:id` | Sender | Edit message |
| DELETE | `/chat/messages/:id` | Sender/ADMIN | Soft-delete message |
| GET | `/meetings/upcoming` | Any auth | Upcoming meetings |
| GET | `/meetings` | Any auth | List meetings (filterable) |
| GET | `/meetings/:id` | Host/participant/ADMIN | Meeting detail |
| POST | `/meetings` | ADMIN, MENTOR | Schedule meeting |
| PATCH | `/meetings/:id/status` | Host/ADMIN | Change status |
| PATCH | `/meetings/:id` | Host/ADMIN | Update meeting |
| DELETE | `/meetings/:id` | Host/ADMIN | Soft-delete meeting |
| GET | `/calendar/month/:year/:month` | Own | Month events |
| GET | `/calendar` | Own | List events (filterable) |
| GET | `/calendar/:id` | Owner | Event detail |
| POST | `/calendar` | Any auth | Create CUSTOM event |
| PATCH | `/calendar/:id` | Owner | Update custom event |
| DELETE | `/calendar/:id` | Owner/ADMIN | Soft-delete event |
| GET | `/notifications` | Own | List notifications |
| PATCH | `/notifications/:id/read` | Own | Mark one read |
| GET | `/dashboard/admin` | ADMIN | Admin stats (now incl. meetings + chat) |
| GET | `/dashboard/mentor` | MENTOR | Mentor stats (now incl. meetings + unread) |
| GET | `/dashboard/mentee` | MENTEE | Mentee stats (now incl. meetings + deadlines) |

---

# 🧭 Key Gotchas (read before you start)

1. **Socket auth is `{ auth: { token } }`**, connecting to the **server origin** `http://localhost:5000` (NOT `/api`), default namespace.
2. **`new_message` fires from BOTH** the socket `send_message` handler AND the REST `POST /messages` endpoint — **de-dupe by `message._id`** so you don't double-render your own sends.
3. **`join_room` / `leave_room` take a bare `roomId` string**; `send_message` / `typing` / `stop_typing` take an **object** `{ roomId, ... }`.
4. **Route ordering** (already handled by the backend, but keep exact paths): `/rooms/direct` ≠ `/rooms/:id`; `/meetings/upcoming` ≠ `/meetings/:id`; `/meetings/:id/status`; `/calendar/month/:year/:month` ≠ `/calendar/:id`.
5. **Chat, calendar, and notification routes have no role gate** — only auth. Access is object-level (participant / owner / creator / admin) enforced by the backend; still gate UI affordances by role where it makes sense.
6. **No REST "mark all notifications read"** — that action is **socket-only** (`mark_all_read`). Single mark-read exists on both socket and REST.
7. **Mentee dashboard `upcomingMeetings` does not populate `participants`** (only `hostId`) — don't assume `participants[].name` is present there.
8. **Only `POST /meetings` (ADMIN|MENTOR)** and the dashboard routes use role authorization; everything else in Phase 3 is "any authenticated + object-level checks".

---

*Backend: The Debug Squad — BITS Pilani*
*Backend REST (dev): `http://localhost:5000/api` · Socket (dev): `http://localhost:5000`*
*Phase 3 — Merges into `phase3` staging branch only. Human merges `phase3 → main`.*
