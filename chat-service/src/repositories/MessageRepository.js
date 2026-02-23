const db = require("../config/db");

exports.create = async (data) => {
  const [result] = await db.query(
    "INSERT INTO messages (chat_id, sender_id, message) VALUES (?,?,?)",
    [data.chat_id, data.sender_id, data.message]
  );

  const [rows] = await db.query(
    "SELECT * FROM messages WHERE id=?",
    [result.insertId]
  );

  return rows[0];
};

exports.findByChat = async (chatId) => {
  const [rows] = await db.query(
    "SELECT * FROM messages WHERE chat_id=? ORDER BY created_at",
    [chatId]
  );
  return rows;
};
