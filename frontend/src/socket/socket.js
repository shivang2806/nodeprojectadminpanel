// socket/socket.js
// ─────────────────────────────────────────────────────────────
// Do NOT auto-connect on import.
// Call connect() after login, disconnect() on logout.
// ─────────────────────────────────────────────────────────────
import { io } from "socket.io-client";

let socket = null;

export function connectSocket() {
  const token = localStorage.getItem("token");
  if (!token) return;

  // If already connected, do nothing
  if (socket?.connected) return;

  socket = io("http://localhost:4000", {
    auth: { token },
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket error:", err.message);
  });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}