const User = require("../models/User");

class UserRepository {
  create(data) {
    return User.create(data);
  }

  findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  findById(id) {
    return User.findByPk(id);
  }

  findAll() {
    return User.findAll({
      attributes: { exclude: ["password"] },
    });
  }

  update(id, data) {
    return User.update(data, { where: { id } });
  }

  delete(id) {
    return User.destroy({ where: { id } });
  }
}

module.exports = new UserRepository();
