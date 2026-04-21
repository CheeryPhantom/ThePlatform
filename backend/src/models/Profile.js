import { db } from '../db.js';

const COLUMNS = [
  'first_name',
  'middle_name',
  'last_name',
  'full_name',
  'phone',
  'headline',
  'date_of_birth',
  'gender',
  'province_code',
  'district_code',
  'municipality_code',
  'ward_number',
  'address_line',
  'postal_code',
  'country_code',
  'experience_years',
  'skills',
  'linkedin_url',
  'github_url',
  'portfolio_url',
  'preferred_title',
  'availability',
  'work_authorization',
  'preferences'
];

const nullish = (v) => (v === '' || v === undefined ? null : v);

const pickRow = (data) => {
  const row = {};
  for (const col of COLUMNS) {
    if (Object.prototype.hasOwnProperty.call(data, col)) {
      let value = data[col];
      if (col === 'preferences') value = value == null ? null : JSON.stringify(value);
      else if (col === 'skills') value = Array.isArray(value) ? value : null;
      else value = nullish(value);
      row[col] = value;
    }
  }
  return row;
};

class Profile {
  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    return result.rows[0];
  }

  static async create(userId, profileData) {
    const row = pickRow(profileData);
    const cols = ['user_id', ...Object.keys(row)];
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const values = [userId, ...Object.values(row)];
    const query = `
      INSERT INTO user_profiles (${cols.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(userId, profileData) {
    const row = pickRow(profileData);
    const keys = Object.keys(row);
    if (!keys.length) return this.findByUserId(userId);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = [...Object.values(row), userId];
    const query = `
      UPDATE user_profiles
         SET ${sets}, updated_at = now()
       WHERE user_id = $${keys.length + 1}
       RETURNING *
    `;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async upsert(userId, profileData) {
    const existing = await this.findByUserId(userId);
    return existing ? this.update(userId, profileData) : this.create(userId, profileData);
  }
}

export default Profile;
