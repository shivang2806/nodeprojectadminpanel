const path     = require("path");
const fs       = require("fs");
const ExcelJS  = require("exceljs");
const bcrypt   = require("bcryptjs");
const JobQueue = require("../queues/JobQueue");
const User     = require("../models/User");

const EXPORTS_DIR = path.join(process.cwd(), "exports");
if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });


// ── POST /api/user/export ─────────────────────────────
// Add export job to MySQL queue
exports.exportUsers = async (req, res) => {
  try {
    const filters = { role: req.query.role || null };

    const jobId = await JobQueue.add({
      requestedBy: req.user.id,
      filters,
    });

    res.status(202).json({
      message:   "Export queued",
      jobId,
      statusUrl: `/api/user/export/status/${jobId}`,
    });
  } catch (err) {
    console.error("exportUsers error:", err);
    res.status(500).json({ message: "Failed to queue export" });
  }
};


// ── GET /api/user/export/status/:jobId ───────────────
exports.exportStatus = async (req, res) => {
  try {
    const job = await JobQueue.getById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({
      jobId:       job.id,
      state:       job.status,
      progress:    job.progress,
      totalRows:   job.total_rows,
      filename:    job.filename,
      error:       job.error,
      createdAt:   job.created_at,
      completedAt: job.completed_at,
      downloadUrl: job.status === "completed"
        ? `/api/user/export/download/${job.id}`
        : null,
    });
  } catch (err) {
    console.error("exportStatus error:", err);
    res.status(500).json({ message: "Failed to get status" });
  }
};


// ── GET /api/user/export/download/:jobId ─────────────
exports.downloadExport = async (req, res) => {
  try {
    const job = await JobQueue.getById(req.params.jobId);

    if (!job)
      return res.status(404).json({ message: "Job not found" });
    if (job.status !== "completed")
      return res.status(400).json({ message: `Not ready. Status: ${job.status}` });
    if (!fs.existsSync(job.filepath))
      return res.status(404).json({ message: "File no longer exists" });

    res.setHeader("Content-Disposition", `attachment; filename="${job.filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    fs.createReadStream(job.filepath).pipe(res);
  } catch (err) {
    console.error("downloadExport error:", err);
    res.status(500).json({ message: "Download failed" });
  }
};


// ── GET /api/user/export/jobs ─────────────────────────
exports.listJobs = async (req, res) => {
  try {
    const jobs = await JobQueue.listByUser(req.user.id);

    res.json({
      jobs: jobs.map((j) => ({
        jobId:       j.id,
        state:       j.status,
        progress:    j.progress,
        totalRows:   j.total_rows,
        filename:    j.filename,
        error:       j.error,
        createdAt:   j.created_at,
        completedAt: j.completed_at,
        downloadUrl: j.status === "completed"
          ? `/api/user/export/download/${j.id}`
          : null,
      })),
    });
  } catch (err) {
    console.error("listJobs error:", err);
    res.status(500).json({ message: "Failed to list jobs" });
  }
};


// ── GET /api/user/import-template ────────────────────
exports.downloadTemplate = async (req, res) => {
  try {
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users Template");

    worksheet.columns = [
      { header: "ID (leave blank)",                    key: "id",    width: 18 },
      { header: "Name *",                              key: "name",  width: 25 },
      { header: "Email *",                             key: "email", width: 30 },
      { header: "Role * (admin / customer / caption)", key: "role",  width: 35 },
    ];

    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF59E0B" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
    worksheet.getRow(1).height = 28;

    // Sample rows
    const samples = [
      { id: "", name: "John Doe",    email: "john@example.com", role: "customer" },
      { id: "", name: "Jane Admin",  email: "jane@example.com", role: "admin"    },
      { id: "", name: "Bob Caption", email: "bob@example.com",  role: "caption"  },
    ];

    samples.forEach((s) => {
      const row = worksheet.addRow(s);
      row.eachCell((cell) => {
        cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8E1" } };
        cell.alignment = { vertical: "middle" };
      });
      row.height = 20;
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users-import-template.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("downloadTemplate error:", err);
    res.status(500).json({ message: "Failed to generate template" });
  }
};


// ── POST /api/user/import ─────────────────────────────
exports.importUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const results = { created: 0, skipped: 0, errors: [] };

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    const worksheet   = workbook.getWorksheet(1);
    const VALID_ROLES = ["admin", "customer", "caption"];
    const DEFAULT_PASS = "Welcome@123";
    const rowsToProcess = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const name  = String(row.getCell(2).value || "").trim();
      const email = String(row.getCell(3).value || "").trim().toLowerCase();
      const role  = String(row.getCell(4).value || "customer").trim().toLowerCase();

      if (!name || !email) {
        results.errors.push({ row: rowNumber, reason: "Name or email missing" });
        return;
      }
      if (!email.includes("@")) {
        results.errors.push({ row: rowNumber, reason: `Invalid email: ${email}` });
        return;
      }
      if (!VALID_ROLES.includes(role)) {
        results.errors.push({
          row: rowNumber,
          reason: `Invalid role "${role}" — must be admin, customer, or caption`,
        });
        return;
      }

      rowsToProcess.push({ name, email, role });
    });

    for (const data of rowsToProcess) {
      try {
        const existing = await User.findOne({ where: { email: data.email } });
        if (existing) {
          results.skipped++;
          continue;
        }
        const hashedPassword = await bcrypt.hash(DEFAULT_PASS, 10);
        await User.create({
          name:     data.name,
          email:    data.email,
          password: hashedPassword,
          role:     data.role,
        });
        results.created++;
      } catch (err) {
        results.errors.push({ email: data.email, reason: err.message });
      }
    }

    // Remove temp uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: `Import complete. ${results.created} created, ${results.skipped} skipped.`,
      results,
      note: `Default password for new users: "${DEFAULT_PASS}"`,
    });
  } catch (err) {
    // Cleanup on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("importUsers error:", err);
    res.status(500).json({ message: "Failed to import users" });
  }
};