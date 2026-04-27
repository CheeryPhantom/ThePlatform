import { db } from '../db.js';

class SavedJob {
  static async save(userId, jobId) {
    await db.query(
      `INSERT INTO saved_jobs (user_id, job_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, job_id) DO NOTHING`,
      [userId, jobId]
    );
    return { user_id: userId, job_id: jobId, saved: true };
  }

  static async unsave(userId, jobId) {
    await db.query(
      `DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2`,
      [userId, jobId]
    );
    return { user_id: userId, job_id: jobId, saved: false };
  }

  static async listForUser(userId) {
    const result = await db.query(
      `SELECT s.job_id, s.saved_at
         FROM saved_jobs s
         JOIN jobs j ON j.id = s.job_id
        WHERE s.user_id = $1
          AND j.status = 'published'
        ORDER BY s.saved_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async idsForUser(userId) {
    const result = await db.query(
      `SELECT job_id FROM saved_jobs WHERE user_id = $1`,
      [userId]
    );
    return result.rows.map((r) => r.job_id);
  }
}

export default SavedJob;
