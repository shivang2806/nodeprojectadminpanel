// ════════════════════════════════════════════════════════
// src/config/scheduler.js  (updated — registers schedulers)
// ════════════════════════════════════════════════════════
const cron              = require("node-cron");
const { runBackup, cleanOldBackups } = require("./backup");
const SchedulerRegistry = require("../monitor/SchedulerRegistry");
const ActivityLog       = require("../monitor/ActivityLog");

const getNextRun = (cronExpr) => {
  // Simple: add schedule interval to now for display
  const now = new Date();
  const next = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day for daily
  return next.toISOString();
};

const startScheduler = () => {
  // ── 1. Daily DB Backup (00:00) ──
  SchedulerRegistry.register("db-backup", {
    description: "Full database backup compressed to ZIP",
    schedule:    "0 0 * * *",
  });
  SchedulerRegistry.setNextRun("db-backup", getNextRun("0 0 * * *"));

  cron.schedule("0 0 * * *", async () => {
    ActivityLog.push("scheduler", "DB Backup started", { scheduler: "db-backup", level: "info" });
    try {
      const result = await runBackup();
      SchedulerRegistry.tick("db-backup");
      ActivityLog.push("scheduler", `DB Backup completed: ${result.filename}`, { scheduler: "db-backup", level: "success" });

      const deleted = cleanOldBackups(7);
      if (deleted > 0) ActivityLog.push("scheduler", `Cleaned ${deleted} old backup(s)`, { scheduler: "db-backup", level: "info" });
    } catch (err) {
      SchedulerRegistry.tick("db-backup", { error: err.message });
      ActivityLog.push("scheduler", `DB Backup failed: ${err.message}`, { scheduler: "db-backup", level: "error" });
    }
    SchedulerRegistry.setNextRun("db-backup", getNextRun("0 0 * * *"));
  });

  // ── 2. Export Jobs Cleanup (every 6 hours) ──
  SchedulerRegistry.register("export-cleanup", {
    description: "Clean completed export jobs older than 7 days",
    schedule:    "0 */6 * * *",
  });

  cron.schedule("0 */6 * * *", async () => {
    ActivityLog.push("scheduler", "Export cleanup started", { scheduler: "export-cleanup", level: "info" });
    try {
      const JobQueue = require("../queues/JobQueue");
      const deleted  = await JobQueue.cleanOld();
      SchedulerRegistry.tick("export-cleanup");
      ActivityLog.push("scheduler", `Export cleanup: removed ${deleted} old job(s)`, { scheduler: "export-cleanup", level: "success" });
    } catch (err) {
      SchedulerRegistry.tick("export-cleanup", { error: err.message });
      ActivityLog.push("scheduler", `Export cleanup failed: ${err.message}`, { scheduler: "export-cleanup", level: "error" });
    }
  });

  // ── 3. Health Check (every minute) ──
  SchedulerRegistry.register("health-check", {
    description: "Checks DB connectivity and system health",
    schedule:    "* * * * *",
  });

  cron.schedule("* * * * *", async () => {
    try {
      const db = require("../config/db");
      await db.query("SELECT 1");
      SchedulerRegistry.tick("health-check");
      ActivityLog.push("scheduler", "Health check passed", { scheduler: "health-check", level: "success" });
    } catch (err) {
      SchedulerRegistry.tick("health-check", { error: err.message });
      ActivityLog.push("scheduler", `Health check failed: ${err.message}`, { scheduler: "health-check", level: "error" });
    }
    SchedulerRegistry.setNextRun("health-check", new Date(Date.now() + 60000).toISOString());
  });

  console.log("📅 Scheduler started (3 jobs registered)");
};

module.exports = { startScheduler };

