import { db } from '../db.js';

class Application {
  static async create(jobId, userId, data = {}) {
    const result = await db.query(
      `INSERT INTO job_applications (job_id, user_id, cover_letter, resume_url, source)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (job_id, user_id) DO NOTHING
       RETURNING *`,
      [jobId, userId, data.cover_letter || null, data.resume_url || null, data.source || 'platform']
    );
    if (result.rows[0]) return result.rows[0];
    const existing = await db.query(
      `SELECT * FROM job_applications WHERE job_id = $1 AND user_id = $2`,
      [jobId, userId]
    );
    return existing.rows[0];
  }

  static async listForUser(userId) {
    const result = await db.query(
      `SELECT a.*, j.title, j.status AS job_status, j.location, j.is_remote,
              e.company_name, e.logo_url AS company_logo_url
         FROM job_applications a
         LEFT JOIN jobs j ON j.id = a.job_id
         LEFT JOIN employers e ON e.id = j.employer_id
        WHERE a.user_id = $1
        ORDER BY a.applied_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async listForJob(jobId, employerId) {
    const result = await db.query(
      `SELECT a.*, u.email, u.name,
              p.first_name, p.last_name, p.headline, p.skills, p.experience_years, p.resume_url
         FROM job_applications a
         JOIN jobs j ON j.id = a.job_id
         JOIN users u ON u.id = a.user_id
         LEFT JOIN user_profiles p ON p.user_id = a.user_id
        WHERE a.job_id = $1 AND j.employer_id = $2
        ORDER BY a.applied_at DESC`,
      [jobId, employerId]
    );
    return result.rows;
  }

  static async findExisting(jobId, userId) {
    const result = await db.query(
      `SELECT * FROM job_applications WHERE job_id = $1 AND user_id = $2`,
      [jobId, userId]
    );
    return result.rows[0] || null;
  }
}

export default Application;
