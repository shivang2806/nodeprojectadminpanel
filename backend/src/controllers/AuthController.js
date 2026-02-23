const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await UserRepository.findByEmail(email);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const userId = Number(user.id); // ← force Number

      const token = jwt.sign(
        { id: userId },               // ← number stored in JWT
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        token,
        role: user.role,
        user: {
          id:    userId,             // ← return id in login response too
          name:  user.name,
          email: user.email,
          role:  user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new AuthController()