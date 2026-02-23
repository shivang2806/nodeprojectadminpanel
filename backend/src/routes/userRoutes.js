// ════════════════════════════════════════════════════════
// src/routes/userRoutes.js  — add these 3 routes
// ════════════════════════════════════════════════════════
const express       = require("express");
const UserController      = require("../controllers/UserController");
const UserExcelController = require("../controllers/UserExcelController");
const authMiddleware      = require("../middlewares/authMiddleware");
const roleMiddleware      = require("../middlewares/roleMiddleware");
const upload              = require("../config/multer");

const router = express.Router();

// Existing routes
router.get("/dashboard",  authMiddleware, UserController.dashboard);
router.get("/list",       authMiddleware, UserController.chatListUsers);
router.get("/",           authMiddleware, roleMiddleware("admin"), UserController.listUsers);
router.post("/",          authMiddleware, roleMiddleware("admin"), UserController.createUser);
router.put("/:id",        authMiddleware, roleMiddleware("admin"), UserController.updateUser);
router.delete("/:id",     authMiddleware, roleMiddleware("admin"), UserController.deleteUser);

// ── Excel routes (admin only) ──
router.get("/export",           authMiddleware, roleMiddleware("admin"), UserExcelController.exportUsers);
router.get("/import-template",  authMiddleware, roleMiddleware("admin"), UserExcelController.downloadTemplate);
router.post("/import",          authMiddleware, roleMiddleware("admin"), upload.single("file"), UserExcelController.importUsers);

module.exports = router;
