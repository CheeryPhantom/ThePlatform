import { db } from '../db.js';

class Badge {
  static async listForUser(userId) {
    const result = await db.query(
      `SELECT *
         FROM user_badges
        WHERE user_id = $1
        ORDER BY awarded_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async award(userId, payload) {
    const {
      badge_key,
      label,
      tier = 'bronze',
      source,
      source_id = null,
      icon = null,
      description = null
    } = payload;

    const result = await db.query(
      `INSERT INTO user_badges
         (user_id, badge_key, label, tier, source, source_id, icon, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, badge_key, source_id) DO UPDATE
          SET tier = EXCLUDED.tier,
              label = EXCLUDED.label,
              icon = EXCLUDED.icon,
              description = EXCLUDED.description,
              awarded_at = now()
       RETURNING *`,
      [userId, badge_key, label, tier, source, source_id, icon, description]
    );
    return result.rows[0];
  }

  static async revokeForSource(userId, source, sourceId) {
    const result = await db.query(
      `DELETE FROM user_badges
         WHERE user_id = $1 AND source = $2 AND source_id = $3
         RETURNING *`,
      [userId, source, sourceId]
    );
    return result.rows;
  }
}

export default Badge;
