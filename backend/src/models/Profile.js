import { db } from '../db.js';

class Profile {
  static async findByUserId(userId) {
    const query = 'SELECT * FROM user_profiles WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async create(userId, profileData) {
    const { full_name, headline, location, experience_years, skills, certifications, resume_url, preferences } = profileData;
    const query = `
      INSERT INTO user_profiles (user_id, full_name, headline, location, experience_years, skills, certifications, resume_url, preferences)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [userId, full_name, headline, location, experience_years, skills, certifications, resume_url, preferences];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(userId, profileData) {
    const { full_name, headline, location, experience_years, skills, certifications, resume_url, preferences } = profileData;
    const query = `
      UPDATE user_profiles
      SET full_name = $1, headline = $2, location = $3, experience_years = $4, skills = $5, certifications = $6, resume_url = $7, preferences = $8, updated_at = now()
      WHERE user_id = $9
      RETURNING *
    `;
    const values = [full_name, headline, location, experience_years, skills, certifications, resume_url, preferences, userId];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async upsert(userId, profileData) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      return this.update(userId, profileData);
    } else {
      return this.create(userId, profileData);
    }
  }
}

export default Profile;