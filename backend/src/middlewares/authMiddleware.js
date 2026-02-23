// ── src/middlewares/authMiddleware.js ─────────────────
// SSE (EventSource) cannot send Authorization headers.
// Update authMiddleware to also accept token from query param:
const jwt  = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");

module.exports = async (req, res, next) => {
  // Accept token from header OR query string (for SSE)
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.query.token;   // ← SSE passes ?token=xxx

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await UserRepository.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user    = user.toJSON ? user.toJSON() : { ...user.dataValues };
    req.user.id = Number(req.user.id);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};