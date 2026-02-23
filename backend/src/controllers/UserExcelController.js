// ════════════════════════════════════════════════════════
// src/controllers/UserExcelController.js
// ════════════════════════════════════════════════════════
const ExcelJS = require("exceljs");
const bcrypt  = require("bcryptjs");
const fs      = require("fs");
const User    = require("../models/User");

// ── EXPORT: GET /api/user/export ─────────────────────────
exports.exportUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    // ── Column definitions ──
    worksheet.columns = [
      { header: "ID",         key: "id",        width: 10 },
      { header: "Name",       key: "name",       width: 25 },
      { header: "Email",      key: "email",      width: 30 },
      { header: "Role",       key: "role",       width: 15 },
      { header: "Created At", key: "createdAt",  width: 22 },
    ];

    // ── Style header row ──
    worksheet.getRow(1).eachCell((cell) => {
      cell.font        = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill        = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
      cell.alignment   = { vertical: "middle", horizontal: "center" };
      cell.border      = {
        top:    { style: "thin" }, bottom: { style: "thin" },
        left:   { style: "thin" }, right:  { style: "thin" },
      };
    });
    worksheet.getRow(1).height = 30;

    // ── Role badge colors ──
    const roleColors = {
      admin:    "FFEF4444",
      customer: "FF3B82F6",
      caption:  "FF10B981",
    };

    // ── Add data rows ──
    users.forEach((user, idx) => {
      const row = worksheet.addRow({
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: new Date(user.createdAt).toLocaleString(),
      });

      // Alternate row background
      const bgColor = idx % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF";
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.border    = {
          top:    { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left:   { style: "thin", color: { argb: "FFE2E8F0" } },
          right:  { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });

      // Color the role cell
      const roleCell  = row.getCell("role");
      const roleColor = roleColors[user.role] || "FF64748B";
      roleCell.font   = { bold: true, color: { argb: "FFFFFFFF" } };
      roleCell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: roleColor } };
      roleCell.alignment = { horizontal: "center" };

      row.height = 22;
    });

    // ── Auto-filter on header ──
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to:   { row: 1, column: worksheet.columns.length },
    };

    // ── Stream to response ──
    const filename = `users-export-${Date.now()}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ message: "Failed to export users" });
  }
};



// ── IMPORT: POST /api/user/import ────────────────────────
exports.importUsers = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
  
    const results = { created: 0, skipped: 0, errors: [] };
  
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
  
      const worksheet = workbook.getWorksheet(1); // first sheet
  
      const VALID_ROLES   = ["admin", "customer", "caption"];
      const DEFAULT_PASS  = "Welcome@123";  // default password for imported users
      const rowPromises   = [];
  
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
  
        const name  = String(row.getCell(2).value || "").trim();
        const email = String(row.getCell(3).value || "").trim().toLowerCase();
        const role  = String(row.getCell(4).value || "customer").trim().toLowerCase();
  
        // Validate
        if (!name || !email) {
          results.errors.push({ row: rowNumber, reason: "Name or email missing" });
          return;
        }
        if (!email.includes("@")) {
          results.errors.push({ row: rowNumber, reason: `Invalid email: ${email}` });
          return;
        }
        if (!VALID_ROLES.includes(role)) {
          results.errors.push({ row: rowNumber, reason: `Invalid role "${role}" — must be admin, customer, or caption` });
          return;
        }
  
        rowPromises.push({ name, email, role });
      });
  
      // Process all rows
      for (const data of rowPromises) {
        try {
          const existing = await User.findOne({ where: { email: data.email } });
          if (existing) {
            results.skipped++;
            continue;
          }
  
          const hashedPassword = await bcrypt.hash(DEFAULT_PASS, 10);
          await User.create({ name: data.name, email: data.email, password: hashedPassword, role: data.role });
          results.created++;
        } catch (err) {
          results.errors.push({ email: data.email, reason: err.message });
        }
      }
  
      // Remove uploaded file after processing
      fs.unlinkSync(req.file.path);
  
      res.json({
        message: `Import complete. ${results.created} created, ${results.skipped} skipped.`,
        results,
        note: `Default password for new users: "${DEFAULT_PASS}"`,
      });
    } catch (err) {
      // Cleanup file on error
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      console.error("Import error:", err);
      res.status(500).json({ message: "Failed to import users" });
    }
  };
  
  
  // ── DOWNLOAD TEMPLATE: GET /api/user/import-template ─────
  exports.downloadTemplate = async (req, res) => {
    try {
      const workbook  = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Users Template");
  
      worksheet.columns = [
        { header: "ID (leave blank)",  key: "id",    width: 18 },
        { header: "Name *",            key: "name",  width: 25 },
        { header: "Email *",           key: "email", width: 30 },
        { header: "Role * (admin / customer / caption)", key: "role", width: 35 },
      ];
  
      // Style header
      worksheet.getRow(1).eachCell((cell) => {
        cell.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
        cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF59E0B" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
      worksheet.getRow(1).height = 28;
  
      // Sample rows
      const samples = [
        { id: "", name: "John Doe",     email: "john@example.com",  role: "customer" },
        { id: "", name: "Jane Admin",   email: "jane@example.com",  role: "admin"    },
        { id: "", name: "Bob Caption",  email: "bob@example.com",   role: "caption"  },
      ];
  
      samples.forEach(s => {
        const row = worksheet.addRow(s);
        row.eachCell(cell => {
          cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8E1" } };
          cell.alignment = { vertical: "middle" };
        });
        row.height = 20;
      });
  
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="users-import-template.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error("Template error:", err);
      res.status(500).json({ message: "Failed to generate template" });
    }
  };
  
  