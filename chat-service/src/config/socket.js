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

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const decoded  = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId  = Number(decoded.id);  // ← force Number
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Connected: userId=${socket.userId} (${typeof socket.userId})`);

    socket.on("join_chat", (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on("send_message", async ({ chatId, message }) => {
      try {
        const saved = await MessageRepository.create({
          chat_id:   Number(chatId),
          sender_id: Number(socket.userId),  // ← force Number
          message,
        });
        // Emit to all room members including sender
        io.to(`chat_${chatId}`).emit("receive_message", saved);
      } catch (err) {
        console.error("send_message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: userId=${socket.userId}`);
    });
  });
};

