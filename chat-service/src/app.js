// ════════════════════════════════════════════════════════════════
// src/app.js
// ════════════════════════════════════════════════════════════════
const express    = require("express");
const cors       = require("cors");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/chats", chatRoutes);

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", service: "chat" }));

module.exports = app;
