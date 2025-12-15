const express = require("express");
const UserController = require("../controllers/UserController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, UserController.dashboard);

// ADMIN APIs
router.get("/", authMiddleware, roleMiddleware("admin"), UserController.listUsers);
router.post("/", authMiddleware, roleMiddleware("admin"), UserController.createUser);
router.put("/:id", authMiddleware, roleMiddleware("admin"), UserController.updateUser);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), UserController.deleteUser);

module.exports = router;
