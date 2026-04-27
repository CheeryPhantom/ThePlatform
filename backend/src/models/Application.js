import { db } from '../db.js';

class Application {
  static async create(jobId, userId, data = {}) {
    const result = await db.query(
      `INSERT INTO job_applications (job_id, user_id, cover_letter, resume_url, source, answers)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (job_id, user_id) DO NOTHING
       RETURNING *`,
      [
        jobId,
        userId,
        data.cover_letter || null,
        data.resume_url || null,
        data.source || 'platform',
        JSON.stringify(data.answers || {})
      ]
    );
    if (result.rows[0]) return result.rows[0];
    const existing = await db.query(
      `SELECT * FROM job_applications WHERE job_id = $1 AND user_id = $2`,
      [jobId, userId]
    );
    return existing.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT a.*, j.employer_id, j.title AS job_title, u.id AS candidate_user_id, u.name AS candidate_name
         FROM job_applications a
         JOIN jobs j ON j.id = a.job_id
         JOIN users u ON u.id = a.user_id
        WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async withdraw(id, userId) {
    const result = await db.query(
      `UPDATE job_applications
          SET status = 'withdrawn', updated_at = now()
        WHERE id = $1 AND user_id = $2 AND status NOT IN ('hired', 'withdrawn')
        RETURNING *`,
      [id, userId]
    );
    return result.rows[0] || null;
  }

  // Employer-only updates: status + internal_notes
  static async updateAsEmployer(id, employerId, { status, internal_notes }) {
    const fields = [];
    const values = [];
    if (status !== undefined) {
      values.push(status);
      fields.push(`status = $${values.length}`);
      values.push(['reviewing', 'shortlisted', 'interview', 'rejected', 'hired'].includes(status));
      fields.push(`reviewed_at = CASE WHEN $${values.length} AND reviewed_at IS NULL THEN now() ELSE reviewed_at END`);
    }
    if (internal_notes !== undefined) {
      values.push(internal_notes);
      fields.push(`internal_notes = $${values.length}`);
    }
    if (!fields.length) return this.findById(id);
    fields.push(`updated_at = now()`);
    values.push(id);
    values.push(employerId);
    const result = await db.query(
      `UPDATE job_applications a
          SET ${fields.join(', ')}
         FROM jobs j
        WHERE a.id = $${values.length - 1}
          AND a.job_id = j.id
          AND j.employer_id = $${values.length}
        RETURNING a.*`,
      values
    );
    return result.rows[0] || null;
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
