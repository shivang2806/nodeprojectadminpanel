require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");
const { startScheduler } = require("./config/scheduler");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.sync();
    console.log("Database connected");

    startScheduler(); // ← start auto-backup cron

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
  }
})();