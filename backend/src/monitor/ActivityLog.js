// ════════════════════════════════════════════════════════
// src/monitor/ActivityLog.js
// Rolling in-memory log — last 100 events
// ════════════════════════════════════════════════════════
const MAX_LOGS = 100;
const logs = [];

module.exports = {
  push(type, message, meta = {}) {
    logs.unshift({
      id:        Date.now() + Math.random(),
      type,      // queue | scheduler | system
      level:     meta.level || "info",  // info | success | warning | error
      message,
      meta,
      timestamp: new Date().toISOString(),
    });
    if (logs.length > MAX_LOGS) logs.pop();
  },

  all(limit = 50) { return logs.slice(0, limit); },
  clear()         { logs.length = 0; },
};

