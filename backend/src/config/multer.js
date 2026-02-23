// ════════════════════════════════════════════════════════
// src/config/multer.js
// ════════════════════════════════════════════════════════
const multer = require("multer");
const path   = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `users-import-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel",                                           // .xls
  ];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only Excel files (.xlsx, .xls) are allowed"), false);
};

module.exports = multer({ storage, fileFilter });

