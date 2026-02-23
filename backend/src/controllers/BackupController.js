// ════════════════════════════════════════════════════════
// src/controllers/BackupController.js
// ════════════════════════════════════════════════════════
const path = require("path");
const fs   = require("fs");
const { runBackup, cleanOldBackups, listBackups, BACKUP_DIR } = require("../config/backup");

// GET /api/backup — list all backups
exports.list = (req, res) => {
  try {
    const backups = listBackups();
    res.json({ total: backups.length, backups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list backups" });
  }
};

// POST /api/backup — trigger manual backup now
exports.create = async (req, res) => {
  try {
    const result = await runBackup();
    res.json({ message: "Backup created successfully", backup: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Backup failed", error: err.message });
  }
};

// GET /api/backup/download/:filename — download a backup zip
exports.download = (req, res) => {
  try {
    const filename = path.basename(req.params.filename); // sanitize
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Backup file not found" });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/zip");
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Download failed" });
  }
};

// DELETE /api/backup/:filename — delete a specific backup
exports.remove = (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Backup file not found" });
    }

    fs.unlinkSync(filePath);
    res.json({ message: `Backup "${filename}" deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// DELETE /api/backup/clean — delete backups older than N days
exports.clean = (req, res) => {
  try {
    const days    = parseInt(req.query.days) || 7;
    const deleted = cleanOldBackups(days);
    res.json({ message: `Deleted ${deleted} backup(s) older than ${days} days` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cleanup failed" });
  }
};


