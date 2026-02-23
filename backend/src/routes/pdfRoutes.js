// ════════════════════════════════════════════════════════
// src/routes/pdfRoutes.js
// ════════════════════════════════════════════════════════
const express       = require("express");
const PdfController = require("../controllers/PdfController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// Convert raw HTML string → PDF
router.post("/from-html",    authMiddleware, roleMiddleware("admin"), PdfController.fromHtml);

// Convert any URL → PDF
router.post("/from-url",     authMiddleware, roleMiddleware("admin"), PdfController.fromUrl);

// Generate users report PDF from DB
router.get("/users-report",  authMiddleware, roleMiddleware("admin"), PdfController.usersReport);

module.exports = router;
