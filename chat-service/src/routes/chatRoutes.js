// ════════════════════════════════════════════════════════════════
// src/routes/chatRoutes.js
// ════════════════════════════════════════════════════════════════
const express    = require("express");
const auth       = require("../middlewares/authMiddleware");
const ChatCtrl   = require("../controllers/ChatController");

const router = express.Router();

router.get("/",                  auth, ChatCtrl.myChats);   // GET  /api/chats
router.get("/:chatId/messages",  auth, ChatCtrl.messages);  // GET  /api/chats/:chatId/messages
router.post("/start-chat",       auth, ChatCtrl.startChat); // POST /api/chats/start-chat

module.exports = router;

