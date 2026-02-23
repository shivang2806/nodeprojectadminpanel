// ════════════════════════════════════════════════════════
// src/routes/monitorRoutes.js
// ════════════════════════════════════════════════════════
const express           = require("express");
const MonitorController = require("../controllers/MonitorController");
const authMiddleware    = require("../middlewares/authMiddleware");
const roleMiddleware    = require("../middlewares/roleMiddleware");

const router = express.Router();

// All monitor routes: admin only
router.get("/stats",        authMiddleware, roleMiddleware("admin"), MonitorController.stats);
router.get("/stream",       authMiddleware, MonitorController.stream);   // SSE — auth via query token
router.post("/queue/test",  authMiddleware, roleMiddleware("admin"), MonitorController.addTestJob);
router.post("/logs/clear",  authMiddleware, roleMiddleware("admin"), MonitorController.clearLogs);

module.exports = router;
