// ════════════════════════════════════════════════════════
// src/config/scheduler.js
// Auto-backup using cron — runs daily at midnight
// ════════════════════════════════════════════════════════
const cron              = require("node-cron");
const { runBackup, cleanOldBackups } = require("./backup");

const startScheduler = () => {
  // ── Every day at 00:00 ──
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Scheduled backup started...");
    try {
      const result = await runBackup();
      console.log(`✅ Scheduled backup done: ${result.filename}`);

      // Auto-clean backups older than 7 days
      const deleted = cleanOldBackups(7);
      if (deleted > 0) console.log(`🗑️  Cleaned ${deleted} old backup(s)`);
    } catch (err) {
      console.error("❌ Scheduled backup failed:", err.message);
    }
  });

  console.log("📅 Backup scheduler started (runs daily at midnight)");
};

module.exports = { startScheduler };

