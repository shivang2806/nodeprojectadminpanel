// ════════════════════════════════════════════════════════
// src/config/backup.js
// Core backup logic — dumps DB + zips it
// ════════════════════════════════════════════════════════
const mysqldump = require("mysqldump");
const archiver  = require("archiver");
const path      = require("path");
const fs        = require("fs");

// Root backup folder: backend/backups/
const BACKUP_DIR = path.join(process.cwd(), "backups");

// Ensure folder exists on startup
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// ── Format: 2026-02-23_14-30-00 ──
const getTimestamp = () => {
  const now = new Date();
  const d   = now.toISOString().slice(0, 10);
  const t   = now.toTimeString().slice(0, 8).replace(/:/g, "-");
  return `${d}_${t}`;
};

// ── Zip a .sql file → .zip, then delete the .sql ──
const zipFile = (sqlPath, zipPath) => {
  return new Promise((resolve, reject) => {
    const output  = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      fs.unlinkSync(sqlPath); // remove raw .sql after zipping
      resolve(zipPath);
    });

    archive.on("error", reject);
    archive.pipe(output);
    archive.file(sqlPath, { name: path.basename(sqlPath) });
    archive.finalize();
  });
};

// ── Main backup function ──
const runBackup = async () => {
  const timestamp = getTimestamp();
  const sqlFile   = path.join(BACKUP_DIR, `backup_${timestamp}.sql`);
  const zipFile_  = path.join(BACKUP_DIR, `backup_${timestamp}.zip`);

  await mysqldump({
    connection: {
      host:     process.env.DB_HOST     || "localhost",
      user:     process.env.DB_USER     || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME,
    },
    dumpToFile: sqlFile,
  });

  await zipFile(sqlFile, zipFile_);

  const stats    = fs.statSync(zipFile_);
  const sizeMB   = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`✅ Backup saved: backup_${timestamp}.zip (${sizeMB} MB)`);

  return {
    filename:  `backup_${timestamp}.zip`,
    path:      zipFile_,
    size:      stats.size,
    sizeMB:    `${sizeMB} MB`,
    createdAt: new Date().toISOString(),
  };
};

// ── Delete backups older than X days ──
const cleanOldBackups = (keepDays = 7) => {
  const files   = fs.readdirSync(BACKUP_DIR);
  const cutoff  = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  let   deleted = 0;

  files.forEach((file) => {
    const filePath = path.join(BACKUP_DIR, file);
    const stat     = fs.statSync(filePath);
    if (stat.mtimeMs < cutoff) {
      fs.unlinkSync(filePath);
      deleted++;
      console.log(`🗑️  Deleted old backup: ${file}`);
    }
  });

  return deleted;
};

// ── List all backup files ──
const listBackups = () => {
  if (!fs.existsSync(BACKUP_DIR)) return [];

  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith(".zip"))
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stat     = fs.statSync(filePath);
      return {
        filename:  file,
        size:      stat.size,
        sizeMB:    `${(stat.size / (1024 * 1024)).toFixed(2)} MB`,
        createdAt: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first
};

module.exports = { runBackup, cleanOldBackups, listBackups, BACKUP_DIR };

