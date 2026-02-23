// ════════════════════════════════════════════════════════
// src/routes/backupRoutes.js
// ════════════════════════════════════════════════════════
const express          = require("express");
const BackupController = require("../controllers/BackupController");
const authMiddleware   = require("../middlewares/authMiddleware");
const roleMiddleware   = require("../middlewares/roleMiddleware");

const router = express.Router();

// All backup routes: admin only
router.get("/",                      authMiddleware, roleMiddleware("admin"), BackupController.list);
router.post("/",                     authMiddleware, roleMiddleware("admin"), BackupController.create);
router.get("/download/:filename",    authMiddleware, roleMiddleware("admin"), BackupController.download);
router.delete("/clean",              authMiddleware, roleMiddleware("admin"), BackupController.clean);
router.delete("/:filename",          authMiddleware, roleMiddleware("admin"), BackupController.remove);

module.exports = router;

