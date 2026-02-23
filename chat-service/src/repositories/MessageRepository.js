const db = require("../config/db");

exports.create = async ({ chat_id, sender_id, message }) => {
  const [result] = await db.query(
    "INSERT INTO messages (chat_id, sender_id, message) VALUES (?, ?, ?)",
    [chat_id, sender_id, message]
  );

  const [rows] = await db.query(
    "SELECT * FROM messages WHERE id = ?",
    [result.insertId]
  );

  const row = rows[0];
  return {
    ...row,
    id:        Number(row.id),
    chat_id:   Number(row.chat_id),
    sender_id: Number(row.sender_id),   // ← force Number
  };
};

exports.findByChat = async (chatId) => {
  const [rows] = await db.query(
    `SELECT m.*, u.name AS sender_name
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.chat_id = ?
     ORDER BY m.created_at ASC`,
    [chatId]
  );

  // ← normalize all ids to Number
  return rows.map(row => ({
    ...row,
    id:        Number(row.id),
    chat_id:   Number(row.chat_id),
    sender_id: Number(row.sender_id),
  }));
};