// ════════════════════════════════════════════════════════
// src/workers/exportWorker.js
// Polls MySQL every 3 seconds for new jobs
// ════════════════════════════════════════════════════════
const ExcelJS  = require("exceljs");
const path     = require("path");
const fs       = require("fs");
const JobQueue = require("../queues/JobQueue");
const User     = require("../models/User");

const EXPORTS_DIR   = path.join(process.cwd(), "exports");
const POLL_INTERVAL = 3000; // ms

const QueueRegistry = require("../monitor/QueueRegistry");
const ActivityLog   = require("../monitor/ActivityLog");

// Register queue on startup
QueueRegistry.register("excel-export", {
  description: "Excel file export jobs for user data",
});

if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });

// ── Process one job ────────────────────────────────────
const processJob = async (job) => {
  QueueRegistry.decrement("excel-export", "waiting");
  QueueRegistry.increment("excel-export", "active");
  ActivityLog.push("queue", `Export job #${job.id} started`, { queue: "excel-export", jobId: job.id, level: "info" });

  console.log(`⚙️  Processing export job #${job.id}`);

  try {
    const filters = job.filters
      ? (typeof job.filters === "string" ? JSON.parse(job.filters) : job.filters)
      : {};

    // 10% — start
    await JobQueue.setProgress(job.id, 10);

    // Fetch users
    const where = {};
    if (filters.role) where.role = filters.role;

    const users = await User.findAll({
      where,
      attributes: ["id", "name", "email", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    await JobQueue.setProgress(job.id, 30);

    // Build Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "DevTools CRM";
    workbook.created  = new Date();
    const sheet = workbook.addWorksheet("Users");

    sheet.columns = [
      { header: "ID",         key: "id",        width: 10 },
      { header: "Name",       key: "name",       width: 25 },
      { header: "Email",      key: "email",      width: 30 },
      { header: "Role",       key: "role",       width: 15 },
      { header: "Created At", key: "createdAt",  width: 22 },
    ];

    // Header styles
    sheet.getRow(1).eachCell((cell) => {
      cell.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border    = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });
    sheet.getRow(1).height = 30;

    await JobQueue.setProgress(job.id, 50);

    const roleColors = { admin: "FFEF4444", customer: "FF3B82F6", caption: "FF10B981" };

    users.forEach((user, idx) => {
      const row = sheet.addRow({
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: new Date(user.createdAt).toLocaleString(),
      });

      const bg = idx % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF";
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle" };
        cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
        cell.border    = { top: { style: "thin", color: { argb: "FFE2E8F0" } }, bottom: { style: "thin", color: { argb: "FFE2E8F0" } }, left: { style: "thin", color: { argb: "FFE2E8F0" } }, right: { style: "thin", color: { argb: "FFE2E8F0" } } };
      });

      const roleCell = row.getCell("role");
      roleCell.font  = { bold: true, color: { argb: "FFFFFFFF" } };
      roleCell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: roleColors[user.role] || "FF64748B" } };
      roleCell.alignment = { horizontal: "center" };
      row.height = 22;
    });

    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 5 } };

    await JobQueue.setProgress(job.id, 80);

    // Save file
    const filename = `users-export-job${job.id}-${Date.now()}.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);
    await workbook.xlsx.writeFile(filepath);

    // Mark complete
    await JobQueue.complete(job.id, { filename, filepath, totalRows: users.length });
    console.log(`✅ Export job #${job.id} done — ${users.length} rows → ${filename}`);

    QueueRegistry.decrement("excel-export", "active");
    QueueRegistry.increment("excel-export", "completed");
    ActivityLog.push("queue", `Export job #${job.id} completed — ${users.length} rows`, { queue: "excel-export", jobId: job.id, level: "success" });

  } catch (err) { 
    QueueRegistry.decrement("excel-export", "active");
    QueueRegistry.increment("excel-export", "failed");
    ActivityLog.push("queue", `Export job #${job.id} failed: ${err.message}`, { queue: "excel-export", jobId: job.id, level: "error" });

    console.error(`❌ Export job #${job.id} failed:`, err.message);
    await JobQueue.fail(job.id, err.message);
  }
};

// ── Poll loop ──────────────────────────────────────────

// Also sync DB counts on each poll
const syncQueueStats = async () => {
  try {
    const db = require("../config/db");
    const [rows] = await db.query(
      "SELECT status, COUNT(*) as count FROM export_jobs GROUP BY status"
    );
    const counts = { waiting: 0, active: 0, completed: 0, failed: 0 };
    rows.forEach(r => { counts[r.status] = Number(r.count); });
    QueueRegistry.sync("excel-export", counts);
  } catch { /* ignore */ }
};

const startWorker = () => {
  console.log("🔧 Export worker started (MySQL queue)");

  const poll = async () => {
    await syncQueueStats();
    try {
      const job = await JobQueue.claimNext();
      if (job) {
        QueueRegistry.increment("excel-export", "waiting"); // will be decremented in processJob
        await processJob(job);
      }
    } catch (err) {
      console.error("Worker poll error:", err.message);
    } finally {
      setTimeout(poll, 3000);
    }
  };

  poll();
};

module.exports = { startWorker };
