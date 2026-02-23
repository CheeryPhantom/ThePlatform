import Joi from 'joi';
import { db } from '../db.js';

const settingsSchema = Joi.object({
  language: Joi.string().min(2).max(10).default('en-US'),
  email_on_message: Joi.boolean().required(),
  email_on_job_match: Joi.boolean().required(),
  subscribe_newsletter: Joi.boolean().required(),
  profile_public: Joi.boolean().required()
});

export const getPublicUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT u.id, u.name, u.role, u.created_at,
             p.full_name, p.headline, p.location, p.experience_years, p.skills
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      LIMIT 1
    `;

    const result = await db.query(query, [id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get public user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSettings = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      const inserted = await db.query(
        'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
        [req.user.id]
      );
      return res.json(inserted.rows[0]);
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { error, value } = settingsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const query = `
      INSERT INTO user_settings
        (user_id, language, email_on_message, email_on_job_match, subscribe_newsletter, profile_public, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, now())
      ON CONFLICT (user_id)
      DO UPDATE SET
        language = EXCLUDED.language,
        email_on_message = EXCLUDED.email_on_message,
        email_on_job_match = EXCLUDED.email_on_job_match,
        subscribe_newsletter = EXCLUDED.subscribe_newsletter,
        profile_public = EXCLUDED.profile_public,
        updated_at = now()
      RETURNING *
    `;

    const result = await db.query(query, [
      req.user.id,
      value.language,
      value.email_on_message,
      value.email_on_job_match,
      value.subscribe_newsletter,
      value.profile_public
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
