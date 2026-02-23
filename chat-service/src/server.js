// ════════════════════════════════════════════════════════════════
// src/server.js
// ════════════════════════════════════════════════════════════════
require("dotenv").config();
const http       = require("http");
const app        = require("./app");
const initSocket = require("./config/socket");

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Chat service running on port ${PORT}`);
});