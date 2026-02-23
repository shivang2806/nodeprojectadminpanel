// ════════════════════════════════════════════════════════
// src/monitor/SchedulerRegistry.js
// Central registry — all schedulers register here
// ════════════════════════════════════════════════════════
const jobs = new Map();

module.exports = {
  // Register a scheduler
  register(name, { description, schedule, status = "running" }) {
    jobs.set(name, {
      name,
      description,
      schedule,
      status,           // running | stopped | error
      lastRun:  null,
      nextRun:  null,
      runCount: 0,
      lastError: null,
    });
  },

  // Update after each run
  tick(name, { error = null } = {}) {
    const job = jobs.get(name);
    if (!job) return;
    job.lastRun   = new Date().toISOString();
    job.runCount += 1;
    job.status    = error ? "error" : "running";
    job.lastError = error || null;
    jobs.set(name, job);
  },

  setNextRun(name, date) {
    const job = jobs.get(name);
    if (!job) return;
    job.nextRun = date instanceof Date ? date.toISOString() : date;
    jobs.set(name, job);
  },

  setStatus(name, status) {
    const job = jobs.get(name);
    if (!job) return;
    job.status = status;
    jobs.set(name, job);
  },

  all() { return Array.from(jobs.values()); },
  get(name) { return jobs.get(name) || null; },
};
