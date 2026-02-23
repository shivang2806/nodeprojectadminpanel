const jwt  = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await UserRepository.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    // ← always expose id as a Number on req.user
    req.user    = user.toJSON ? user.toJSON() : { ...user.dataValues };
    req.user.id = Number(req.user.id);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
