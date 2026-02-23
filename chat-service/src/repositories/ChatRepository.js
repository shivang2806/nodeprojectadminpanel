const db = require("../config/db");

exports.findByUser = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM chats WHERE user1_id=? OR user2_id=?",
    [userId, userId]
  );
  return rows;
};

exports.findOrCreateChat = async (user1, user2) => {
  const [existing] = await db.query(
    `SELECT * FROM chats 
     WHERE (user1_id = ? AND user2_id = ?)
     OR (user1_id = ? AND user2_id = ?)`,
    [user1, user2, user2, user1]
  );

  if (existing.length) return existing[0];

  const [result] = await db.query(
    "INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)",
    [user1, user2]
  );

  return {
    id: result.insertId,
    user1_id: user1,
    user2_id: user2,
  };
};