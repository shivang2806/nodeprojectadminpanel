const express = require("express");
const jwt = require("jsonwebtoken");
const ChatController = require("../controllers/ChatController");

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

router.get("/", auth, ChatController.myChats);
router.get("/:chatId/messages", auth, ChatController.messages);
router.post("/start", auth, ChatController.startChat);
router.post("/start-chat", auth, ChatController.startChat);


module.exports = router;
