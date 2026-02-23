// ════════════════════════════════════════════════════════
// src/controllers/MonitorController.js
// ════════════════════════════════════════════════════════
const os                = require("os");
const JobQueue          = require("../queues/JobQueue");
const SchedulerRegistry = require("../monitor/SchedulerRegistry");
const QueueRegistry     = require("../monitor/QueueRegistry");
const ActivityLog       = require("../monitor/ActivityLog");

// ── GET /api/monitor/stats ────────────────────────────
// Full snapshot — called on initial load + SSE updates
exports.stats = async (req, res) => {
  try {
    // Sync live DB counts
    const db = require("../config/db");
    const [rows] = await db.query(
      "SELECT status, COUNT(*) as count FROM export_jobs GROUP BY status"
    );
    const counts = { waiting: 0, active: 0, completed: 0, failed: 0 };
    rows.forEach(r => { counts[r.status] = Number(r.count); });
    QueueRegistry.sync("excel-export", counts);

    // System info
    const uptime   = process.uptime();
    const memUsage = process.memoryUsage();
    const cpuLoad  = os.loadavg();

    res.json({
      system: {
        uptime:      Math.floor(uptime),
        uptimeHuman: formatUptime(uptime),
        memUsedMB:   Math.round(memUsage.rss / 1024 / 1024),
        memTotalMB:  Math.round(os.totalmem() / 1024 / 1024),
        memPercent:  Math.round((memUsage.rss / os.totalmem()) * 100),
        cpuLoad1:    cpuLoad[0].toFixed(2),
        nodeVersion: process.version,
        platform:    process.platform,
      },
      queues:     QueueRegistry.all(),
      schedulers: SchedulerRegistry.all(),
      logs:       ActivityLog.all(30),
      timestamp:  new Date().toISOString(),
    });
  } catch (err) {
    console.error("monitor stats error:", err);
    res.status(500).json({ message: "Failed to fetch monitor stats" });
  }
};

// ── GET /api/monitor/stream  (SSE — real-time push) ──
exports.stream = (req, res) => {
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const send = async () => {
    try {
      // Sync DB counts
      const db = require("../config/db");
      const [rows] = await db.query(
        "SELECT status, COUNT(*) as count FROM export_jobs GROUP BY status"
      );
      const counts = { waiting: 0, active: 0, completed: 0, failed: 0 };
      rows.forEach(r => { counts[r.status] = Number(r.count); });
      QueueRegistry.sync("excel-export", counts);

      const memUsage = process.memoryUsage();

      const data = {
        queues:     QueueRegistry.all(),
        schedulers: SchedulerRegistry.all(),
        logs:       ActivityLog.all(20),
        system: {
          memUsedMB:  Math.round(memUsage.rss / 1024 / 1024),
          memPercent: Math.round((memUsage.rss / os.totalmem()) * 100),
          uptime:     Math.floor(process.uptime()),
          uptimeHuman: formatUptime(process.uptime()),
        },
        timestamp: new Date().toISOString(),
      };

      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch { /* ignore */ }
  };

  // Send immediately + every 3 seconds
  send();
  const timer = setInterval(send, 3000);

  // Cleanup on disconnect
  req.on("close", () => {
    clearInterval(timer);
    res.end();
  });
};

// ── POST /api/monitor/queue/test ─────────────────────
// Add a sample test job to the export queue
exports.addTestJob = async (req, res) => {
  try {
    const jobId = await JobQueue.add({
      requestedBy: req.user.id,
      filters:     { role: req.body.role || null },
    });
    ActivityLog.push("queue", `Test job #${jobId} queued manually`, { queue: "excel-export", jobId, level: "info" });
    res.json({ message: "Test job added", jobId });
  } catch (err) {
    res.status(500).json({ message: "Failed to add test job" });
  }
};

// ── POST /api/monitor/logs/clear ─────────────────────
exports.clearLogs = (req, res) => {
  ActivityLog.clear();
  res.json({ message: "Logs cleared" });
};

// ── Helpers ───────────────────────────────────────────
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

