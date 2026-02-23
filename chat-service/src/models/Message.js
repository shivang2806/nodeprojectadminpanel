
// ════════════════════════════════════════════════════════════════
// src/models/Message.js  (schema reference — raw SQL)
// ════════════════════════════════════════════════════════════════
/*
CREATE TABLE IF NOT EXISTS messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  chat_id    INT NOT NULL,
  sender_id  INT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);
*/