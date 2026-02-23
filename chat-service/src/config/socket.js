const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const MessageRepository = require("../repositories/MessageRepository");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // 🔐 Socket JWT auth
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.userId);

    socket.on("join_chat", (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`👥 User ${socket.userId} joined chat_${chatId}`);
    });

    socket.on("send_message", async ({ chatId, message }) => {
      const savedMessage = await MessageRepository.create({
        chat_id: chatId,
        sender_id: socket.userId,
        message,
      });
    
      io.to(`chat_${chatId}`).emit("new_message", savedMessage);
    });
    

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.userId);
    });
  });
};
