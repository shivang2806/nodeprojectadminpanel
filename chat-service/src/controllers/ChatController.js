// ════════════════════════════════════════════════════════════════
// src/controllers/ChatController.js
// ════════════════════════════════════════════════════════════════
const ChatRepository    = require("../repositories/ChatRepository");
const MessageRepository = require("../repositories/MessageRepository");

exports.myChats = async (req, res) => {
  try {
    const chats = await ChatRepository.findByUser(req.user.id);
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load chats" });
  }
};

exports.messages = async (req, res) => {
  try {
    const messages = await MessageRepository.findByChat(req.params.chatId);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

exports.startChat = async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ message: "receiverId is required" });
    if (receiverId === req.user.id) return res.status(400).json({ message: "Cannot chat with yourself" });

    const chat = await ChatRepository.findOrCreate(req.user.id, receiverId);
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start chat" });
  }
};
