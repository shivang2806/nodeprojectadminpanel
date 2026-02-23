require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");
// const { startScheduler } = require("./config/scheduler");
const { startWorker } = require("./workers/exportWorker");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.sync();
    console.log("Database connected");

    startWorker();      // ← start MySQL queue worker
    // startScheduler();   // ← backup scheduler

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
  }
})();