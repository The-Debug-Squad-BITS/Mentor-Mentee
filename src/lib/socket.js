import { io } from "socket.io-client";

// Socket.io connects to the server ORIGIN, not the /api REST path.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

// Read the JWT exactly the way src/lib/api.js does, so REST and socket stay in sync.
function getToken() {
  return (
    localStorage.getItem("eduflow_token") ||
    JSON.parse(localStorage.getItem("eduflow_auth") || "{}")?.state?.token ||
    null
  );
}

/**
 * Open (or reuse) the shared socket connection.
 * Pass the token explicitly right after login to avoid any persist-timing race;
 * otherwise it is read from storage (e.g. on a page reload with a saved session).
 */
export function connectSocket(tokenArg) {
  const token = tokenArg || getToken();
  if (!token) return null;

  // Reuse an existing instance (connected OR still connecting) to avoid duplicates.
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: { token }, // preferred handshake form — backend reads handshake.auth.token
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
  });

  socket.on("connect_error", (err) => {
    // err.message starts with "Authentication error:" for bad/expired tokens.
    console.error("Socket connection error:", err.message);
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
