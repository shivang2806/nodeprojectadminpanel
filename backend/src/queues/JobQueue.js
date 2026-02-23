// Uses mysql2/promise pool directly — NOT Sequelize
// This avoids the ? placeholder mismatch and missing transaction methods
const db = require("../config/db"); // mysql2/promise pool

class JobQueue {

  // ── Add a new job ──────────────────────────────────────
  static async add({ requestedBy, filters = {} }) {
    const [result] = await db.query(
      `INSERT INTO export_jobs (requested_by, filters, status, progress)
       VALUES (?, ?, 'waiting', 0)`,
      [requestedBy, JSON.stringify(filters)]
    );
    return result.insertId;
  }

  // ── Claim the next waiting job (atomic) ───────────────
  // Uses a dedicated connection with transaction so no two
  // workers ever pick the same job
  static async claimNext() {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        `SELECT * FROM export_jobs
         WHERE status = 'waiting' AND attempts < 3
         ORDER BY created_at ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED`
      );

      if (!rows.length) {
        await conn.rollback();
        return null;
      }

      const job = rows[0];

      await conn.query(
        `UPDATE export_jobs
         SET status = 'active', attempts = attempts + 1, updated_at = NOW()
         WHERE id = ?`,
        [job.id]
      );

      await conn.commit();
      return job;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // ── Update progress ────────────────────────────────────
  static async setProgress(jobId, progress) {
    await db.query(
      "UPDATE export_jobs SET progress = ?, updated_at = NOW() WHERE id = ?",
      [progress, jobId]
    );
  }

  // ── Mark completed ─────────────────────────────────────
  static async complete(jobId, { filename, filepath, totalRows }) {
    await db.query(
      `UPDATE export_jobs
       SET status = 'completed', progress = 100,
           filename = ?, filepath = ?, total_rows = ?,
           completed_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [filename, filepath, totalRows, jobId]
    );
  }

  // ── Mark failed (retry up to 3 times) ─────────────────
  static async fail(jobId, errorMessage) {
    await db.query(
      `UPDATE export_jobs
       SET status = IF(attempts >= 3, 'failed', 'waiting'),
           error = ?, updated_at = NOW()
       WHERE id = ?`,
      [errorMessage, jobId]
    );
  }

  // ── Get single job by id ───────────────────────────────
  static async getById(jobId) {
    const [rows] = await db.query(
      "SELECT * FROM export_jobs WHERE id = ?",
      [jobId]
    );
    return rows[0] || null;
  }

  // ── List jobs for a specific user ──────────────────────
  static async listByUser(userId) {
    const [rows] = await db.query(
      `SELECT id, status, progress, filename, total_rows,
              filters, error, attempts, created_at, completed_at
       FROM export_jobs
       WHERE requested_by = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );
    return rows;
  }

  // ── Delete old completed/failed jobs (> 7 days) ───────
  static async cleanOld() {
    const [result] = await db.query(
      `DELETE FROM export_jobs
       WHERE status IN ('completed', 'failed')
       AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    return result.affectedRows;
  }
}

module.exports = JobQueue;