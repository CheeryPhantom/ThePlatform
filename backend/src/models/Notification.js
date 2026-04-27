import { db } from '../db.js';

class Notification {
  static async create({ userId, actorId = null, category, type, link = null, payload = null }) {
    const result = await db.query(
      `INSERT INTO notifications (user_id, actor_id, category, type, link, payload)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, actorId, category, type, link, payload ? JSON.stringify(payload) : null]
    );
    return result.rows[0];
  }

  static async listForUser(userId, { limit = 30 } = {}) {
    const result = await db.query(
      `SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
      [userId, Math.min(limit, 100)]
    );
    return result.rows;
  }

  static async unreadCount(userId) {
    const result = await db.query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );
    return result.rows[0].count;
  }

  static async markRead(userId, ids) {
    if (!Array.isArray(ids) || !ids.length) return [];
    const result = await db.query(
      `UPDATE notifications
          SET read = TRUE
        WHERE user_id = $1 AND id = ANY($2::uuid[])
        RETURNING id`,
      [userId, ids]
    );
    return result.rows.map((r) => r.id);
  }

  static async markAllRead(userId) {
    await db.query(
      `UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );
  }
}

export default Notification;
