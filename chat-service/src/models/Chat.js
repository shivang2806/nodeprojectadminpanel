// ════════════════════════════════════════════════════════════════
// src/models/Chat.js  (schema reference — raw SQL)
// ════════════════════════════════════════════════════════════════
/*
CREATE TABLE IF NOT EXISTS chats (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user1_id   INT NOT NULL,
  user2_id   INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_chat (user1_id, user2_id)
);
*/