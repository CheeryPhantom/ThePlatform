import { db } from '../db.js';

class Employer {
  static async findByUserId(userId) {
    const query = 'SELECT * FROM employers WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async create(userId, employerData) {
    const { company_name, website, bio } = employerData;
    const query = `
      INSERT INTO employers (user_id, company_name, website, bio)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [userId, company_name, website, bio];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(userId, employerData) {
    const { company_name, website, bio } = employerData;
    const query = `
      UPDATE employers
      SET company_name = $1, website = $2, bio = $3, updated_at = now()
      WHERE user_id = $4
      RETURNING *
    `;
    const values = [company_name, website, bio, userId];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async upsert(userId, employerData) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      return this.update(userId, employerData);
    } else {
      return this.create(userId, employerData);
    }
  }
}

export default Employer;