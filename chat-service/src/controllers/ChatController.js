const ChatRepository = require("../repositories/ChatRepository");
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
  const messages = await MessageRepository.findByChat(req.params.chatId);
  res.json(messages);
};

exports.startChat = async (req, res) => {
  const { receiverId } = req.body;

  const chat = await ChatRepository.findOrCreateChat(
    req.user.id,
    receiverId
  );

  res.json(chat);
};