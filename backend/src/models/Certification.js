import { db } from '../db.js';

class Certification {
  static async listForUser(userId) {
    const result = await db.query(
      `SELECT *
         FROM user_certifications
        WHERE user_id = $1
        ORDER BY issue_date DESC NULLS LAST, created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async create(userId, data) {
    const query = `
      INSERT INTO user_certifications
        (user_id, catalog_slug, title, issuer, issue_date, expiry_date,
         credential_url, credential_id, proof_file_id, status, tier, skills_covered, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`;
    const values = [
      userId,
      data.catalog_slug || null,
      data.title,
      data.issuer,
      data.issue_date || null,
      data.expiry_date || null,
      data.credential_url || null,
      data.credential_id || null,
      data.proof_file_id || null,
      data.status || 'pending',
      data.tier || 'bronze',
      data.skills_covered || null,
      data.notes || null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(userId, id) {
    const result = await db.query(
      `DELETE FROM user_certifications WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }
}

export default Certification;
