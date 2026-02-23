// ════════════════════════════════════════════════════════
// src/monitor/QueueRegistry.js
// Live in-memory queue stats tracker
// ════════════════════════════════════════════════════════
const queues = new Map();

module.exports = {
  register(name, { description }) {
    if (!queues.has(name)) {
      queues.set(name, {
        name,
        description,
        waiting:   0,
        active:    0,
        completed: 0,
        failed:    0,
        total:     0,
      });
    }
  },

  increment(name, field) {
    const q = queues.get(name);
    if (!q) return;
    if (field in q) q[field]++;
    q.total = q.waiting + q.active + q.completed + q.failed;
    queues.set(name, q);
  },

  decrement(name, field) {
    const q = queues.get(name);
    if (!q) return;
    if (field in q && q[field] > 0) q[field]--;
    q.total = q.waiting + q.active + q.completed + q.failed;
    queues.set(name, q);
  },

  // Sync counts directly from DB
  sync(name, counts) {
    const q = queues.get(name);
    if (!q) return;
    Object.assign(q, counts);
    q.total = (q.waiting || 0) + (q.active || 0) + (q.completed || 0) + (q.failed || 0);
    queues.set(name, q);
  },

  all()       { return Array.from(queues.values()); },
  get(name)   { return queues.get(name) || null; },
};

