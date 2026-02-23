const express = require("express");
const cors = require("cors");
const fs = require("fs");
const backupRoutes = require("./routes/backupRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const monitorRoutes = require("./routes/monitorRoutes");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors()); // ✅ CORS enabled
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/monitor", monitorRoutes);

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

module.exports = app;
