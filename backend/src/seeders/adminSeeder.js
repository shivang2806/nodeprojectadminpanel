const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");
const User = require("../models/User");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected for seeding");

    const adminEmail = "admin@gmail.com";

    const existingAdmin = await User.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("12345", 10);

    await User.create({
      name: "admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin user created successfully");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeder error:", error);
    process.exit(1);
  }
})();
