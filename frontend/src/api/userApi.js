// ─── api/userApi.js ───────────────────────────────────────────────────────────
import api from "./axios";

export const getDashboard  = ()         => api.get("/api/user/dashboard");
export const getUsers      = ()         => api.get("/api/user");
export const getChatUsers  = ()         => api.get("/api/user/list");
export const createUser    = (data)     => api.post("/api/user", data);
export const updateUser    = (id, data) => api.put(`/api/user/${id}`, data);
export const deleteUser    = (id)       => api.delete(`/api/user/${id}`);
