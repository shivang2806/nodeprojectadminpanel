// ─── api/chatApi.js ───────────────────────────────────────────────────────────
import axios from "axios";

// Separate instance for chat server (port 4000)
const chatApi = axios.create({ baseURL: "http://localhost:4000" });

chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getChats     = ()           => chatApi.get("/api/chats");
export const getMessages  = (chatId)     => chatApi.get(`/api/chats/${chatId}/messages`);
export const startChat    = (receiverId) => chatApi.post("/api/chats/start-chat", { receiverId });
