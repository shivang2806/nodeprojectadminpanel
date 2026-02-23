// ════════════════════════════════════════════════════════════════
// src/repositories/ChatRepository.js
// ════════════════════════════════════════════════════════════════
const db = require("../config/db");

exports.findByUser = async (userId) => {
  const [rows] = await db.query(
    `SELECT c.*,
       u1.name AS user1_name,
       u2.name AS user2_name
     FROM chats c
     JOIN users u1 ON c.user1_id = u1.id
     JOIN users u2 ON c.user2_id = u2.id
     WHERE c.user1_id = ? OR c.user2_id = ?
     ORDER BY c.created_at DESC`,
    [userId, userId]
  );
  return rows;
};

exports.findOrCreate = async (user1, user2) => {
  // Always store with lower id first to enforce the UNIQUE constraint
  const [a, b] = user1 < user2 ? [user1, user2] : [user2, user1];

  const [existing] = await db.query(
    "SELECT * FROM chats WHERE user1_id = ? AND user2_id = ?",
    [a, b]
  );

  if (existing.length) return existing[0];

  const [result] = await db.query(
    "INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)",
    [a, b]
  );

  return { id: result.insertId, user1_id: a, user2_id: b };
};
