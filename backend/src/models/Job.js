import { db } from '../db.js';

const JOB_SELECT = `
  j.id, j.employer_id, j.created_by_user_id, j.title, j.description,
  j.requirements, j.location, j.is_remote, j.employment_type, j.experience_level,
  j.currency, j.salary_min, j.salary_max, j.application_url,
  j.status, j.active, j.posted_at, j.expires_at, j.closed_at, j.metadata,
  j.created_at, j.updated_at,
  e.company_name, e.logo_url AS company_logo_url, e.location AS company_location
`;

class Job {
  static async create(employerId, createdByUserId, data) {
    const result = await db.query(
      `INSERT INTO jobs
         (employer_id, created_by_user_id, title, description, requirements, location,
          is_remote, employment_type, experience_level, currency,
          salary_min, salary_max, application_url, status, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        employerId,
        createdByUserId,
        data.title,
        data.description || null,
        data.requirements ? JSON.stringify(data.requirements) : null,
        data.location ? JSON.stringify(data.location) : null,
        data.is_remote ?? false,
        data.employment_type || null,
        data.experience_level || null,
        data.currency || 'NPR',
        data.salary_min ?? null,
        data.salary_max ?? null,
        data.application_url || null,
        data.status || 'draft',
        data.metadata ? JSON.stringify(data.metadata) : null
      ]
    );
    return result.rows[0];
  }

  static async update(jobId, employerId, data) {
    const fields = [];
    const values = [];
    const push = (col, val) => {
      fields.push(`${col} = $${fields.length + 1}`);
      values.push(val);
    };
    if (data.title !== undefined) push('title', data.title);
    if (data.description !== undefined) push('description', data.description);
    if (data.requirements !== undefined)
      push('requirements', data.requirements ? JSON.stringify(data.requirements) : null);
    if (data.location !== undefined)
      push('location', data.location ? JSON.stringify(data.location) : null);
    if (data.is_remote !== undefined) push('is_remote', data.is_remote);
    if (data.employment_type !== undefined) push('employment_type', data.employment_type);
    if (data.experience_level !== undefined) push('experience_level', data.experience_level);
    if (data.currency !== undefined) push('currency', data.currency);
    if (data.salary_min !== undefined) push('salary_min', data.salary_min);
    if (data.salary_max !== undefined) push('salary_max', data.salary_max);
    if (data.application_url !== undefined) push('application_url', data.application_url);
    if (data.status !== undefined) push('status', data.status);
    if (data.metadata !== undefined)
      push('metadata', data.metadata ? JSON.stringify(data.metadata) : null);

    if (!fields.length) return this.findById(jobId);

    fields.push(`updated_at = now()`);
    values.push(jobId, employerId);
    const result = await db.query(
      `UPDATE jobs
          SET ${fields.join(', ')}
        WHERE id = $${values.length - 1} AND employer_id = $${values.length}
        RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async setStatus(jobId, employerId, status) {
    const extraCol =
      status === 'published'
        ? ', posted_at = COALESCE(posted_at, now())'
        : status === 'closed'
        ? ', closed_at = now()'
        : '';
    const result = await db.query(
      `UPDATE jobs
          SET status = $1, updated_at = now()${extraCol}
        WHERE id = $2 AND employer_id = $3
        RETURNING *`,
      [status, jobId, employerId]
    );
    return result.rows[0] || null;
  }

  static async delete(jobId, employerId) {
    const result = await db.query(
      `DELETE FROM jobs WHERE id = $1 AND employer_id = $2 RETURNING id`,
      [jobId, employerId]
    );
    return result.rows[0] || null;
  }

  static async findById(jobId) {
    const result = await db.query(
      `SELECT ${JOB_SELECT}
         FROM jobs j
         LEFT JOIN employers e ON e.id = j.employer_id
        WHERE j.id = $1`,
      [jobId]
    );
    return result.rows[0] || null;
  }

  static async listPublished({ search, location, limit = 50, offset = 0 } = {}) {
    const where = [`j.status = 'published'`, `j.active = TRUE`];
    const values = [];
    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      where.push(
        `(LOWER(j.title) LIKE $${values.length} OR LOWER(j.description) LIKE $${values.length})`
      );
    }
    if (location) {
      values.push(`%${location.toLowerCase()}%`);
      where.push(
        `(LOWER(COALESCE(j.location->>'city','')) LIKE $${values.length} OR LOWER(COALESCE(e.location,'')) LIKE $${values.length})`
      );
    }
    values.push(limit);
    values.push(offset);
    const result = await db.query(
      `SELECT ${JOB_SELECT}
         FROM jobs j
         LEFT JOIN employers e ON e.id = j.employer_id
        WHERE ${where.join(' AND ')}
        ORDER BY j.posted_at DESC NULLS LAST, j.created_at DESC
        LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return result.rows;
  }

  static async listForEmployer(employerId) {
    const result = await db.query(
      `SELECT ${JOB_SELECT},
              (SELECT COUNT(*)::int FROM job_applications a WHERE a.job_id = j.id) AS applicants_count
         FROM jobs j
         LEFT JOIN employers e ON e.id = j.employer_id
        WHERE j.employer_id = $1
        ORDER BY j.updated_at DESC`,
      [employerId]
    );
    return result.rows;
  }
}

export default Job;
