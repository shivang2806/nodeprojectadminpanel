// ════════════════════════════════════════════════════════
// src/controllers/PdfController.js
// ════════════════════════════════════════════════════════
const puppeteer = require("puppeteer");
const path      = require("path");
const fs        = require("fs");

const PDFS_DIR = path.join(process.cwd(), "pdfs");
if (!fs.existsSync(PDFS_DIR)) fs.mkdirSync(PDFS_DIR, { recursive: true });

// ── Shared: launch browser once, reuse ───────────────
let browser = null;

const getBrowser = async () => {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
};


// ── POST /api/pdf/from-html ───────────────────────────
// Body: { html, filename?, options? }
exports.fromHtml = async (req, res) => {
  const { html, filename = "document", options = {} } = req.body;

  if (!html) return res.status(400).json({ message: "html is required" });

  try {
    const b    = await getBrowser();
    const page = await b.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format:          options.format      || "A4",
      printBackground: options.printBackground !== false,   // default true
      margin: {
        top:    options.margin?.top    || "20mm",
        right:  options.margin?.right  || "15mm",
        bottom: options.margin?.bottom || "20mm",
        left:   options.margin?.left   || "15mm",
      },
      landscape: options.landscape || false,
    });

    await page.close();

    const safeFilename = `${filename.replace(/[^a-zA-Z0-9-_]/g, "_")}-${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("fromHtml error:", err);
    res.status(500).json({ message: "PDF generation failed", error: err.message });
  }
};


// ── POST /api/pdf/from-url ────────────────────────────
// Body: { url, filename?, options? }
exports.fromUrl = async (req, res) => {
  const { url, filename = "page", options = {} } = req.body;

  if (!url) return res.status(400).json({ message: "url is required" });

  try {
    const b    = await getBrowser();
    const page = await b.newPage();

    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format:          options.format      || "A4",
      printBackground: options.printBackground !== false,
      margin: {
        top:    options.margin?.top    || "20mm",
        right:  options.margin?.right  || "15mm",
        bottom: options.margin?.bottom || "20mm",
        left:   options.margin?.left   || "15mm",
      },
      landscape: options.landscape || false,
    });

    await page.close();

    const safeFilename = `${filename.replace(/[^a-zA-Z0-9-_]/g, "_")}-${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("fromUrl error:", err);
    res.status(500).json({ message: "PDF generation failed", error: err.message });
  }
};


// ── POST /api/pdf/users-report ────────────────────────
// Generates a styled users list PDF from DB
exports.usersReport = async (req, res) => {
  const User = require("../models/User");

  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    const roleColor = { admin: "#EF4444", customer: "#3B82F6", caption: "#10B981" };

    const rows = users.map((u, i) => `
      <tr style="background:${i % 2 === 0 ? "#F8FAFC" : "#FFFFFF"};">
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>
          <span style="background:${roleColor[u.role] || "#64748B"};color:#fff;
                       padding:3px 10px;border-radius:6px;font-size:12px;font-weight:600;">
            ${u.role}
          </span>
        </td>
        <td>${new Date(u.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: 'Segoe UI', sans-serif; color: #0F172A; padding: 30px; }

          .header {
            display: flex; justify-content: space-between; align-items: center;
            padding-bottom: 20px; border-bottom: 2px solid #E2E8F0; margin-bottom: 24px;
          }
          .logo { display: flex; align-items: center; gap: 12px; }
          .logo-icon {
            width: 44px; height: 44px; border-radius: 10px;
            background: linear-gradient(135deg, #F59E0B, #FCD34D);
            display: flex; align-items: center; justify-content: center;
            font-size: 22px; font-weight: 700; color: #fff;
          }
          .logo-text { font-size: 22px; font-weight: 700; }
          .meta { font-size: 13px; color: #64748B; text-align: right; }

          h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #0F172A; }

          .summary {
            display: flex; gap: 16px; margin-bottom: 24px;
          }
          .summary-card {
            flex: 1; padding: 14px 18px; border-radius: 10px;
            border: 1px solid #E2E8F0; background: #F8FAFC;
          }
          .summary-card .label { font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 600; letter-spacing: 0.5px; }
          .summary-card .value { font-size: 26px; font-weight: 700; color: #0F172A; font-family: monospace; }

          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          thead tr { background: #1E3A5F; color: #fff; }
          thead th { padding: 12px 14px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          tbody td { padding: 10px 14px; border-bottom: 1px solid #E2E8F0; }

          .footer {
            margin-top: 30px; padding-top: 16px; border-top: 1px solid #E2E8F0;
            font-size: 11px; color: #94A3B8; text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <div class="logo-icon">D</div>
            <span class="logo-text">DevTools CRM</span>
          </div>
          <div class="meta">
            <div><strong>Users Report</strong></div>
            <div>Generated: ${new Date().toLocaleString()}</div>
          </div>
        </div>

        <h2>Users List</h2>

        <div class="summary">
          <div class="summary-card">
            <div class="label">Total Users</div>
            <div class="value">${users.length}</div>
          </div>
          <div class="summary-card">
            <div class="label">Admins</div>
            <div class="value">${users.filter(u => u.role === "admin").length}</div>
          </div>
          <div class="summary-card">
            <div class="label">Customers</div>
            <div class="value">${users.filter(u => u.role === "customer").length}</div>
          </div>
          <div class="summary-card">
            <div class="label">Captions</div>
            <div class="value">${users.filter(u => u.role === "caption").length}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="footer">
          DevTools CRM • Confidential • ${new Date().getFullYear()}
        </div>
      </body>
      </html>
    `;

    const b    = await getBrowser();
    const page = await b.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
    });

    await page.close();

    const filename = `users-report-${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("usersReport error:", err);
    res.status(500).json({ message: "PDF generation failed", error: err.message });
  }
};
