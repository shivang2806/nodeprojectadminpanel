const bcrypt = require("bcryptjs");
const UserRepository = require("../repositories/UserRepository");

class UserController {

  async dashboard(req, res) {
    res.json({
      message: "Welcome",
      name: req.user.name,
      role: req.user.role,
    });
  }

  async listUsers(req, res) {
    const users = await UserRepository.findAll();
    res.json(users);
  }

  async createUser(req, res) {
    const { name, email, password, role } = req.body;

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: "User created", user });
  }

  async updateUser(req, res) {
    const { id } = req.params;
    await UserRepository.update(id, req.body);
    res.json({ message: "User updated" });
  }

  async deleteUser(req, res) {
    const { id } = req.params;
    await UserRepository.delete(id);
    res.json({ message: "User deleted" });
  }
}

module.exports = new UserController();
