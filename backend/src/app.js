const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors()); // ✅ CORS enabled
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
